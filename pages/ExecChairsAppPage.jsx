import { useState, useEffect } from 'react';
import ExecChairProfile from './components/ExecChairProfile';
// You can import other components here, like AdvisoryBoard, TeamMembers, etc.
import { fetchProfiles } from '../src/services/googleSheetsService';
import {
  View,
  Heading,
  Text,
  Grid,
  SelectField,
  Flex,
  Loader,
  useTheme,
} from '@aws-amplify/ui-react';

const ExecChairsAppPage = () => {
  const { tokens } = useTheme();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedPage, setSelectedPage] = useState('execChairs'); // New state for page selection

  useEffect(() => {
    const getProfiles = async () => {
      try {
        setLoading(true);
        const profilesData = await fetchProfiles();
        setProfiles(profilesData);
        setError(null);
      } catch (err) {
        setError(`Failed to load executive chairs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getProfiles();
  }, []);

  const majors = [...new Set(profiles.map(profile => profile.major))].filter(Boolean);
  const filteredProfiles = filterDepartment
    ? profiles.filter(profile => profile.major === filterDepartment)
    : profiles;

  return (
    <View backgroundColor={tokens.colors.neutral[10].value} padding={tokens.space.large.value} minHeight="100vh">
      <View maxWidth="1200px" margin="0 auto" padding={tokens.space.medium.value}>
        {/* Page switcher */}
        <View maxWidth="400px" margin="0 auto" marginBottom={tokens.space.large.value}>
          <SelectField
            label="Select Section"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            <option value="execChairs">Executive Chairs</option>
            <option value="SBOD">Student Board of Directors</option>
          </SelectField>
        </View>

        {selectedPage === 'execChairs' && (
          <>
            <View textAlign="center" marginBottom={tokens.space.xl.value}>
              <Heading level={1} color="#1A54C4" marginBottom={tokens.space.small.value}>
                Executive Chairs
              </Heading>
              <Text fontSize={tokens.fontSizes.large.value} color={tokens.colors.neutral[80].value} marginBottom={tokens.space.xl.value}>
                Meet our leadership team and department chairs
              </Text>

              <View maxWidth="400px" margin="0 auto" marginBottom={tokens.space.xl.value}>
                <SelectField
                  label="Filter by Major"
                  labelHidden={false}
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  fontSize={tokens.fontSizes.medium.value}
                >
                  <option value="">All Majors</option>
                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </SelectField>
              </View>
            </View>

            {loading ? (
              <Flex justifyContent="center" alignItems="center" height="400px">
                <Loader size="large" />
              </Flex>
            ) : error ? (
              <View backgroundColor={tokens.colors.red[10].value} padding={tokens.space.large.value} borderRadius={tokens.radii.large.value} maxWidth="600px" margin="0 auto" textAlign="center">
                <Heading level={3} color={tokens.colors.red[80].value} marginBottom={tokens.space.small.value}>
                  Error
                </Heading>
                <Text color={tokens.colors.red[80].value}>{error}</Text>
              </View>
            ) : filteredProfiles.length === 0 ? (
              <View backgroundColor={tokens.colors.neutral[20].value} padding={tokens.space.large.value} borderRadius={tokens.radii.large.value} maxWidth="600px" margin="0 auto" textAlign="center">
                <Heading level={3} marginBottom={tokens.space.small.value}>
                  No Executive Chairs Found
                </Heading>
                <Text>There are no chairs available for the selected major.</Text>
              </View>
            ) : (
              <Grid templateColumns={{ base: "1fr", large: "1fr 1fr" }} gap={tokens.space.xl.value}>
                {filteredProfiles.map((profile) => (
                  <ExecChairProfile key={profile.id} profile={profile} />
                ))}
              </Grid>
            )}

            <View textAlign="center" marginTop={tokens.space.xxl.value} color={tokens.colors.neutral[60].value}>
              <Text>Data populated from Google Sheets API.</Text>
              <Text marginTop={tokens.space.xs.value}>Total executive chairs: {profiles.length}</Text>
              <Text marginTop={tokens.space.small.value} fontSize={tokens.fontSizes.xs.value}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </View>
          </>
        )}

        {selectedPage === 'SBOD' && (
          <View textAlign="center">
            <Heading level={2} marginBottom={tokens.space.medium.value}>Student Board of Directors</Heading>
            <Text>This is where the Student Board of Directors content will go.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ExecChairsAppPage;
