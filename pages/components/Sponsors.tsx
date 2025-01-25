// components/Sponsors.tsx
import {
    View,
    Heading,
    Grid,
    Image,
    useTheme,
    Flex,
    Link as AmplifyLink,
  } from '@aws-amplify/ui-react';
  
  interface Sponsor {
    id: string;
    name: string;
    imageUrl: string;
    websiteUrl?: string;
  }
  
  // Sample sponsor data - replace with your actual sponsors
  const SPONSORS: Sponsor[] = [
    {
      id: '1',
      name: 'Sponsor 1',
      imageUrl: '/api/placeholder/300/300',
      websiteUrl: 'https://example.com'
    },
    {
      id: '2',
      name: 'Sponsor 2',
      imageUrl: '/api/placeholder/300/300',
      websiteUrl: 'https://example.com'
    },
    {
      id: '3',
      name: 'Sponsor 3',
      imageUrl: '/api/placeholder/300/300',
      websiteUrl: 'https://example.com'
    },
  ];
  
  export default function Sponsors() {
    const { tokens } = useTheme();
  
    const SponsorContent = ({ sponsor }: { sponsor: Sponsor }) => (
      <Flex
        direction="column"
        alignItems="center"
        className="sponsor-item"
      >
        <Image
          src={sponsor.imageUrl}
          alt={`${sponsor.name} logo`}
          width="200px"
          height="200px"
          objectFit="contain"
        />
      </Flex>
    );
  
    return (
      <View
        borderRadius="medium"
        boxShadow="medium"
        backgroundColor="white"
        padding="2rem"
        maxWidth="1200px"
        margin="0 auto"
      >
        <Heading 
          level={2} 
          marginBottom={tokens.space.xl}
          color="#1A54C4"
        >
          Thank You to Our Sponsors
        </Heading>
  
        <Grid
          templateColumns={{ base: "1fr", medium: "1fr 1fr 1fr" }}
          gap={tokens.space.xl}
        >
          {SPONSORS.map((sponsor) => (
            <View key={sponsor.id}>
              {sponsor.websiteUrl ? (
                <AmplifyLink
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SponsorContent sponsor={sponsor} />
                </AmplifyLink>
              ) : (
                <SponsorContent sponsor={sponsor} />
              )}
            </View>
          ))}
        </Grid>
      </View>
    );
  }