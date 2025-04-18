import React from 'react';
import {
  View,
  Card,
  Image,
  Text,
  Heading,
  Divider,
  Link,
  Button,
  useTheme
} from '@aws-amplify/ui-react';

const ExecChairProfile = ({ profile }) => {
  const { tokens } = useTheme();
  
  // Photo display component
  const PhotoDisplay = () => {
    if (profile.photoUrl) {
      return (
        <Image 
          src={profile.photoUrl} 
          alt={`${profile.name || 'Chair'} photo`}
          width="100%"
          height="200px"
          objectFit="cover"
          borderRadius={`${tokens.radii.large.value} ${tokens.radii.large.value} 0 0`}
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300?text=No+Image";
          }}
        />
      );
    }
    
    // Fallback placeholder
    return (
      <View 
        width="100%" 
        height="200px" 
        backgroundColor={tokens.colors.neutral[10].value}
        display="flex"
        alignItems="center"
        justifyContent="center"
        direction="column"
        borderRadius={`${tokens.radii.large.value} ${tokens.radii.large.value} 0 0`}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.neutral[60].value} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <Text 
          color={tokens.colors.neutral[80].value}
          marginTop={tokens.space.small.value}
        >
          No Photo Available
        </Text>
      </View>
    );
  };

  return (
    <Card
      borderRadius={tokens.radii.large.value}
      variation="elevated"
      boxShadow={tokens.shadows.medium.value}
      padding="0"
      overflow="hidden"
    >
      <PhotoDisplay />
      
      <View padding={tokens.space.large.value}>
        <View textAlign="center" marginBottom={tokens.space.medium.value}>
          <Heading level={3} color="#1A54C4" marginBottom={tokens.space.xs.value}>
            {profile.name || 'Unknown Name'}
          </Heading>
          <Text color={tokens.colors.neutral[80].value}>
            {profile.year || 'Unknown Year'}
          </Text>
          <Text color={tokens.colors.neutral[80].value}>
            {profile.major || 'Unknown Major'}
          </Text>
        </View>
        
        <Divider marginVertical={tokens.space.medium.value} />
        
        <View gap={tokens.space.medium.value}>
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Weekly Availability:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value}>
              {profile.hours || 'Not specified'} hours per week
            </Text>
          </View>
          
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Other Clubs/Organizations:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value}>
              {profile.clubs || 'None specified'}
            </Text>
          </View>
          
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Why They Want to Join:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value} fontStyle="italic">
              {profile.why || 'No reason provided'}
            </Text>
          </View>
        </View>
        
        {profile.resumeUrl && (
          <View textAlign="center" marginTop={tokens.space.large.value}>
            <Button
              as={Link}
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              backgroundColor="#1A54C4"
              color="white"
              padding={`${tokens.space.small.value} ${tokens.space.large.value}`}
              borderRadius={tokens.radii.medium.value}
              _hover={{
                backgroundColor: "#153F94",
                textDecoration: "none"
              }}
            >
              View Resume
            </Button>
          </View>
        )}
      </View>
    </Card>
  );
};

export default ExecChairProfile;