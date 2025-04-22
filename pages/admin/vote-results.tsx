import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Text,
  Heading,
  View,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Badge,
  Loader,
  Button,
  Alert,
  useTheme,
} from '@aws-amplify/ui-react';
import { useAuth } from '../context/AuthContext';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

interface VoteResult {
  id: string;
  candidateId: string;
  candidateName: string;
  voteCount: number;
  lastUpdated: string;
}

const VoteResultsPage = () => {
  const { tokens } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      // Redirect non-admins to home page
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
      } else {
        fetchVoteResults();
      }
    };

    checkAccess();
  }, [isAuthenticated, isAdmin, router]);

  const fetchVoteResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      const results = await client.models.VoteSummary.list();
      
      // Sort results by vote count in descending order
      const sortedResults = [...results.data].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      setVoteResults(sortedResults as VoteResult[]);
    } catch (err) {
      setError(`Failed to load vote results: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View padding={tokens.space.large.value}>
      <View maxWidth="1200px" margin="0 auto">
        <View marginBottom={tokens.space.large.value}>
          <Heading level={1}>Executive Chair Vote Results</Heading>
          <Text>View voting results for executive chair candidates</Text>
        </View>

        <Button 
          onClick={() => router.push('/admin')}
          marginBottom={tokens.space.large.value}
        >
          Back to Admin Dashboard
        </Button>

        {error && (
          <Alert variation="error" marginBottom={tokens.space.large.value}>
            {error}
          </Alert>
        )}

        {loading ? (
          <View padding={tokens.space.xl.value} textAlign="center">
            <Loader size="large" />
            <Text marginTop={tokens.space.medium.value}>Loading vote results...</Text>
          </View>
        ) : voteResults.length === 0 ? (
          <View backgroundColor={tokens.colors.neutral[20].value} padding={tokens.space.large.value} borderRadius={tokens.radii.large.value}>
            <Heading level={3} marginBottom={tokens.space.small.value}>
              No Votes Recorded
            </Heading>
            <Text>There are no votes recorded yet.</Text>
          </View>
        ) : (
          <>
            <Table highlightOnHover={true}>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Candidate ID</TableCell>
                  <TableCell as="th">Candidate Name</TableCell>
                  <TableCell as="th">Vote Count</TableCell>
                  <TableCell as="th">Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voteResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.candidateId}</TableCell>
                    <TableCell>{result.candidateName || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variation="info" size="large">
                        {result.voteCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(result.lastUpdated).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <View textAlign="center" marginTop={tokens.space.xxl.value} color={tokens.colors.neutral[60].value}>
              <Text marginTop={tokens.space.xs.value}>Total candidates with votes: {voteResults.length}</Text>
              <Text marginTop={tokens.space.small.value} fontSize={tokens.fontSizes.xs.value}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default VoteResultsPage;