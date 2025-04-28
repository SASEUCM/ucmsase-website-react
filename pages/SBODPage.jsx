import { useState, useEffect } from 'react';
import SBODProfile from './components/SBODProfile';
import { fetchSBODProfiles } from '../src/services/googleSheetsService';
import { useAuth } from './context/AuthContext';
import {
  View,
  Heading,
  Text,
  Grid,
  SelectField,
  Flex,
  Loader,
  Button,
  useTheme,
} from '@aws-amplify/ui-react';

const SBODPage = () => {
  const { tokens } = useTheme();
  const { checkAuth } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showVoting, setShowVoting] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('director');

  useEffect(() => {
    const getProfiles = async () => {
      try {
        setLoading(true);
        const profilesData = await fetchSBODProfiles();
        setProfiles(profilesData);
        setError(null);
      } catch (err) {
        setError(`Failed to load SBOD members: ${err.message}`);
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
        <View textAlign="center" marginBottom={tokens.space.xl.value}>
          <Heading level={1} color="#1A54C4" marginBottom={tokens.space.small.value}>
            Student Board of Directors
          </Heading>
          <Text fontSize={tokens.fontSizes.large.value} color={tokens.colors.neutral[80].value} marginBottom={tokens.space.medium.value}>
            Meet our Student Board of Directors
          </Text>
          
          {/* Large, prominent voting button */}
          <Button
            onClick={() => {
              // When enabling voting, refresh auth state to ensure it's current
              if (!showVoting) {
                checkAuth().then(() => {
                  setShowVoting(true);
                });
              } else {
                setShowVoting(false);
              }
            }}
            backgroundColor={showVoting ? "#6A5ACD" : "#22BC66"}
            color="white"
            padding={`${tokens.space.medium.value} ${tokens.space.xl.value}`}
            borderRadius={tokens.radii.medium.value}
            marginBottom={tokens.space.large.value}
            fontSize={tokens.fontSizes.large.value}
            fontWeight="bold"
            boxShadow={tokens.shadows.medium.value}
            _hover={{
              backgroundColor: showVoting ? "#5D4BA8" : "#1DAA5B",
              transform: "scale(1.05)",
              boxShadow: tokens.shadows.large.value
            }}
            transition="all 0.2s ease-in-out"
          >
            {showVoting ? "✓ Hide Voting Interface" : "👉 SHOW VOTING INTERFACE 👈"}
          </Button>
          
          <Flex direction="row" justifyContent="center" wrap="wrap" gap={tokens.space.medium.value} marginBottom={tokens.space.large.value}>
            <View maxWidth="250px" marginBottom={tokens.space.medium.value}>
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
            
            {showVoting && (
              <View maxWidth="250px" marginBottom={tokens.space.medium.value}>
                <SelectField
                  label="Select Position for Voting"
                  labelHidden={false}
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  fontSize={tokens.fontSizes.medium.value}
                >
                  <option value="webmaster">Webmaster (Math & Tech Lead)</option>
                  <option value="cultural">Cultural/Social Coordinator</option>
                  <option value="ui-ux-marketing">UI/UX/Marketing Lead</option>
                  <option value="engineering-vanguard">Engineering Lead (Vanguard Representative)</option>
                  <option value="natural-sciences-research">Natural Sciences Lead (Research Development Lead)</option>
                  <option value="events">Events Chair</option>
                </SelectField>
              </View>
            )}
          </Flex>
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
              No SBOD Members Found
            </Heading>
            <Text>There are no SBOD members available for the selected major.</Text>
          </View>
        ) : (
          <>
            {/* First check if we have any candidates for the selected position */}
            {showVoting && filteredProfiles.filter(profile => {
              // Debug to see all position selections
              console.log(`Checking SBOD ${profile.name} for position ${selectedPosition}:`,
                profile.preferredPositions || 'No positions specified');
                
              return profile.preferredPositions && 
                profile.preferredPositions.length > 0 && 
                profile.preferredPositions.includes(selectedPosition.toLowerCase());
            }).length === 0 ? (
              <View backgroundColor={tokens.colors.neutral[20].value} padding={tokens.space.large.value} borderRadius={tokens.radii.large.value} maxWidth="600px" margin="0 auto" textAlign="center">
                <Heading level={3} marginBottom={tokens.space.small.value}>
                  No Candidates for {selectedPosition}
                </Heading>
                <Text>There are no candidates who applied for the {selectedPosition} position. Try selecting a different position.</Text>
              </View>
            ) : (
              <Grid templateColumns={{ base: "1fr", large: "1fr 1fr" }} gap={tokens.space.xl.value}>
                {filteredProfiles
                  // Filter by preferred positions if showing voting
                  .filter((profile) => {
                    if (!showVoting) return true;
                    
                    // Debug position preferences
                    console.log(`Filtering SBOD ${profile.name} for position ${selectedPosition}:`, 
                      profile.preferredPositions || 'No position preferences');
                    
                    // If candidate has preferred positions, filter based on the selected position
                    if (profile.preferredPositions && profile.preferredPositions.length > 0) {
                      const isMatch = profile.preferredPositions.includes(selectedPosition.toLowerCase());
                      console.log(`SBOD ${profile.name} match for ${selectedPosition}: ${isMatch}`);
                      return isMatch;
                    }
                    
                    // For backward compatibility: if no preferred positions specified, show all candidates
                    console.log(`SBOD ${profile.name} has no preferred positions, showing by default`);
                    return true;
                  })
                  .map((profile) => (
                    <SBODProfile 
                      key={profile.id} 
                      profile={profile} 
                      showVoting={showVoting}
                      position={selectedPosition}
                    />
                  ))
                }
              </Grid>
            )}
          </>
        )}

        <View textAlign="center" marginTop={tokens.space.xxl.value} color={tokens.colors.neutral[60].value}>
          <Text>Data populated from Google Sheets API.</Text>
          <Text marginTop={tokens.space.xs.value}>Total SBOD members: {profiles.length}</Text>
          <Text marginTop={tokens.space.small.value} fontSize={tokens.fontSizes.xs.value}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SBODPage;