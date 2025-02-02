// pages/about.tsx
import AboutUs from './components/AboutUs';
import { View, Image, Text } from '@aws-amplify/ui-react';
import UpcomingEvents from './components/UpcomingEvents';

export default function AboutPage() {
  return (
    <View
      as="main"
      /*backgroundColor="#f5f5f5"*/
      backgroundColor="transparent"
      minHeight="100vh"
      padding="2rem"
    >
      {/* SASE Board Image */}
      <View
        textAlign="center"
        marginBottom="2rem"
      >
        <Image
          src="/SaseBoard.jpeg" // Replace with the actual path to your image
          alt="SASE Board"
          width="100%"
          maxWidth="800px"
          height="auto"
          borderRadius="medium"
          boxShadow="medium"
        />
        <Text
          fontSize="1.2rem"
          color="gray"
          marginTop="1rem"
        >
          Our dedicated SASE board working together to bring you the best experience.
        </Text>
      </View>

      {/* AboutUs Component */}
      <AboutUs />
    </View>
  );
}