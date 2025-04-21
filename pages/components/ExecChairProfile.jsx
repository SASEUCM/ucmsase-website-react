import React, { useState, useEffect } from 'react';
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
  
  // Photo display component with delayed loading
  const PhotoDisplay = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      // Only run this effect if we have a photoUrl
      if (!profile.photoUrl) {
        setIsLoading(false);
        return;
      }
      
      // Extract file ID from Google Drive URL
      const getFileId = (url) => {
        const idMatch = url.match(/id=([^&]+)/);
        if (idMatch && idMatch[1]) return idMatch[1];
        
        const fileMatch = url.match(/\/d\/([^\/]+)/);
        if (fileMatch && fileMatch[1]) return fileMatch[1];
        
        const openMatch = url.match(/\/open\?id=([^&]+)/);
        if (openMatch && openMatch[1]) return openMatch[1];
        
        return null;
      };

      const fileId = getFileId(profile.photoUrl);
      
      if (fileId) {
        // Use the index from the profile ID to set staggered loading times
        // Extract the number from the chair-X ID to use for staggered loading
        const profileIndex = parseInt(profile.id.replace('chair-', ''), 10) || 1;
        
        // Set a delay based on the profile index to stagger image loading (500ms apart)
        const delay = (profileIndex - 1) * 500;
        
        console.log(`Chair ${profile.name}: loading image with ID ${fileId} after ${delay}ms delay`);
        
        // Use the Google Drive thumbnail API but with a staggered delay
        const timer = setTimeout(() => {
          const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
          setImageSrc(thumbnailUrl);
          setIsLoading(false);
        }, delay);
        
        // Clean up the timer if component unmounts
        return () => clearTimeout(timer);
      } else {
        // If no Google Drive fileId found, just use the original URL
        setImageSrc(profile.photoUrl);
        setIsLoading(false);
      }
    }, [profile.photoUrl, profile.id, profile.name]); // Re-run effect if these dependencies change
    
    if (!profile.photoUrl) {
      // Fallback placeholder when no photo URL is available
      return (
        <View 
          width="100%" 
          height="400px" 
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
    }
    
    return (
      <div
        style={{
          width: '100%',
          height: '400px', // Further increased height for more square proportion
          overflow: 'hidden',
          borderRadius: `${tokens.radii.large.value} ${tokens.radii.large.value} 0 0`,
          backgroundColor: tokens.colors.neutral[10].value,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative' // Added to help with positioning
        }}
      >
        {isLoading ? (
          // Show a loading indicator while the image is being fetched
          <div style={{ textAlign: 'center' }}>
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={tokens.colors.neutral[40].value} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ animation: 'spin 1.5s linear infinite' }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </svg>
            <Text 
              color={tokens.colors.neutral[60].value} 
              fontSize={tokens.fontSizes.small.value}
              marginTop={tokens.space.xs.value}
            >
              Loading photo...
            </Text>
          </div>
        ) : (
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            <img 
              src={imageSrc}
              alt={`${profile.name || 'Chair'} photo`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top', // Position image from the top center
                display: 'block'
              }}
              onError={(e) => {
                console.error('Image failed to load:', imageSrc);
                e.target.src = "https://placehold.co/400x300?text=No+Image";
              }}
            />
          </div>
        )}
      </div>
    );
  };
  
  // Helper function to check if field has meaningful content
  const hasContent = (field) => {
    return field && field.trim() !== '';
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
            {hasContent(profile.name) ? profile.name : 'Unknown Name'}
          </Heading>
          <Text color={tokens.colors.neutral[80].value}>
            {hasContent(profile.year) ? profile.year : 'Unknown Year'}
          </Text>
          <Text color={tokens.colors.neutral[80].value}>
            {hasContent(profile.major) ? profile.major : 'Unknown Major'}
          </Text>
        </View>
        
        <Divider marginVertical={tokens.space.medium.value} />
        
        <View gap={tokens.space.medium.value}>
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Weekly Availability:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value}>
              {hasContent(profile.hours) ? `${profile.hours} hours per week` : 'Not specified'}
            </Text>
          </View>
          
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Other Clubs/Organizations:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value}>
              {hasContent(profile.clubs) ? profile.clubs : 'None specified'}
            </Text>
          </View>
          
          <View>
            <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
              Why They Want to Join:
            </Text>
            <Text fontSize={tokens.fontSizes.small.value} fontStyle="italic">
              {hasContent(profile.why) ? profile.why : 'No reason provided'}
            </Text>
          </View>
          
          {hasContent(profile.careerAlignment) && (
            <View>
              <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
                How SASE Aligns with Career Goals:
              </Text>
              <Text fontSize={tokens.fontSizes.small.value} fontStyle="italic">
                {profile.careerAlignment}
              </Text>
            </View>
          )}
          
          {hasContent(profile.contribution) && (
            <View>
              <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
                What They Can Provide to SASE:
              </Text>
              <Text fontSize={tokens.fontSizes.small.value} fontStyle="italic">
                {profile.contribution}
              </Text>
            </View>
          )}
          
          {hasContent(profile.technicalSkills) && (
            <View>
              <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
                Technical Skills:
              </Text>
              <Text fontSize={tokens.fontSizes.small.value}>
                {profile.technicalSkills}
              </Text>
            </View>
          )}
          
          {hasContent(profile.achievements) && (
            <View>
              <Text fontWeight="bold" color={tokens.colors.neutral[90].value}>
                Skills/Awards/Certifications:
              </Text>
              <Text fontSize={tokens.fontSizes.small.value}>
                {profile.achievements}
              </Text>
            </View>
          )}
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