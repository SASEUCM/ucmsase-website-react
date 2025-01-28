import { useState, useEffect } from 'react';
import {
  View,
  Heading,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Text,
  Alert,
  SearchField,
  Flex,
  Badge,
  Loader,
  Button,
} from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { useAuth } from '../context/AuthContext';
const client = generateClient<Schema>();

const SubscriberList = () => {
  const [subscribers, setSubscribers] = useState<Array<Schema['Subscriber']['type']>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    console.log('SubscriberList mounted, isAdmin:', isAdmin);
    if (isAdmin) {
      fetchSubscribers();
    }
  }, [isAdmin]);

  const fetchSubscribers = async () => {
    try {
      console.log('Fetching subscribers...');
      setLoading(true);
      setError(null);

      const result = await client.models.Subscriber.list();
      console.log('Subscriber list result:', result);
      
      if (!result || !result.data) {
        throw new Error('No data received from the API');
      }

      setSubscribers(result.data);
      console.log('Subscribers set:', result.data);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching subscribers');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <View padding="2rem">
        <Alert variation="warning">
          You must be an admin to view subscribers.
        </Alert>
      </View>
    );
  }

  if (loading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader size="large" />
        <Text>Loading subscribers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error">
          <Heading level={5}>Error Loading Subscribers</Heading>
          <Text>{error}</Text>
          <Button
            onClick={fetchSubscribers}
            variation="primary"
            marginTop="1rem"
          >
            Try Again
          </Button>
        </Alert>
      </View>
    );
  }

  const filteredSubscribers = subscribers.filter(sub =>
    sub?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View padding="2rem">
      <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="2rem">
        <Heading level={2}>Subscriber List</Heading>
        <Flex gap="1rem">
          <Badge size="large" variation="info">
            {subscribers.length} Total Subscribers
          </Badge>
          <Button onClick={fetchSubscribers} size="small">
            Refresh List
          </Button>
        </Flex>
      </Flex>

      <SearchField
        label="Search subscribers"
        placeholder="Search by name or email..."
        onChange={(e) => setSearchTerm(e.target.value)}
        marginBottom="2rem"
        size="large"
      />

      {filteredSubscribers.length === 0 ? (
        <Text textAlign="center" padding="2rem">
          {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers yet.'}
        </Text>
      ) : (
        <Table highlightOnHover variation="bordered">
          <TableHead>
            <TableRow>
              <TableCell as="th" fontWeight="bold">Name</TableCell>
              <TableCell as="th" fontWeight="bold">Email</TableCell>
              <TableCell as="th" fontWeight="bold">Subscribe Date</TableCell>
              <TableCell as="th" fontWeight="bold">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>{subscriber.name}</TableCell>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>
                  {subscriber.subscribeDate && 
                    new Date(subscriber.subscribeDate).toLocaleDateString()
                  }
                </TableCell>
                <TableCell>
                  <Badge variation={subscriber.isActive ? "success" : "warning"}>
                    {subscriber.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </View>
  );
};

export default SubscriberList;