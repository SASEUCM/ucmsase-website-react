// components/AboutUs.tsx
import { View, Heading, Text } from '@aws-amplify/ui-react';

export default function AboutUs() {
  return (
    <View
      borderRadius="medium"    // Rounded corners
      boxShadow="medium"       // Subtle drop shadow
      backgroundColor="white"  // Card-like background
      padding="2rem"
      maxWidth="1200px"
      margin="0 auto"
    >
      <Heading level={2} marginBlockEnd="1rem">
        About Us
      </Heading>
      <Text>
        Welcome to the Society of Asian Scientists and Engineers at UC Merced.
        We empower Asian heritage scientists and engineers in their academic
        and professional journeys.
      </Text>
    </View>
  );
}