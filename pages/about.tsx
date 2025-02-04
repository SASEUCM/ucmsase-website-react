// pages/about.tsx
import AboutUs from './components/AboutUs';
import { View, Image, Text } from '@aws-amplify/ui-react';
import UpcomingEvents from './components/UpcomingEvents';

export default function AboutPage() {
  return (
    <View
      as="main"
      backgroundColor="transparent"
      /*backgroundColor="#f5f5f5"*/
      minHeight="100vh"
      padding="2rem"
    >
      {/* AboutUs Component with Border and Background */}
      <View
        backgroundColor="white"
        borderRadius="medium"
        padding="2rem"
        boxShadow="medium"
        border="1px solid #e0e0e0" // Add a border
      >
        <AboutUs />
      </View>

      {/* SASE Board Image */}
      <View
        textAlign="center"
        marginTop="2rem" // Add margin to separate from AboutUs
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
    </View>
  );
}