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

      {/* Background image with blur */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/SaseBoard.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)' // Prevents blur edges from showing
        }}
      />

      {/* SASE Board Image */}
      <View
        textAlign="center"
        marginTop="2rem" // Add margin to separate from AboutUs
      >
        <Image
          src="golfcartpic.png" // Replace with the actual path to your image
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