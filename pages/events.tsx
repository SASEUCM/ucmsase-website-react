// pages/events.tsx
import UpcomingEvents from './components/UpcomingEvents';
import { View } from '@aws-amplify/ui-react';

export default function EventsPage() {
  return (
    <View
      as="main"
      borderRadius="small"
      backgroundColor="#0a1930"
      minHeight="20vh"
      padding="0.5rem"
      marginTop="6rem" // <-- Reduced space to fix height issue
    >
      {/* Background image with blur */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/gang.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)' // Prevents blur edges from showing
        }}
      />
      <UpcomingEvents />
    </View>
  );
}
