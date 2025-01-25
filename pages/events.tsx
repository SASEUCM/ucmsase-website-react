// pages/events.tsx
import UpcomingEvents from './components/UpcomingEvents';
import { View } from '@aws-amplify/ui-react';

export default function EventsPage() {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <UpcomingEvents />
    </View>
  );
}
