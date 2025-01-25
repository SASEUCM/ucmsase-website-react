// pages/about.tsx
import AboutUs from './components/AboutUs';
import { View } from '@aws-amplify/ui-react';
import UpcomingEvents from './components/UpcomingEvents';

export default function AboutPage() {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <AboutUs />
    </View>
  );
}
