// components/UpcomingEvents.tsx
import { View, Heading, Flex, Card, Text } from '@aws-amplify/ui-react';

interface EventItem {
  date: string;
  title: string;
  time?: string;
}

// Sample data for demonstration
const EVENTS: EventItem[] = [
  { date: 'Jan 29', title: 'SBOD Meeting', time: '8pm' },
  { date: 'Jan 31', title: 'Weekly General', time: '6pm' },
  { date: 'Feb 1', title: 'Exec Meeting', time: '10am' },
];

export default function UpcomingEvents() {
  return (
    <View
      borderRadius="medium"
      boxShadow="medium"
      backgroundColor="white"
      padding="2rem"
      maxWidth="1200px"
      margin="0 auto"
    >
      <Heading level={2} marginBlockEnd="1rem">
        Upcoming Events
      </Heading>

      <View as="div" overflow="hidden" position="relative" width="100%" height="600px">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=ucmerced%40saseconnect.org&ctz=America%2FLos_Angeles"
          style={{ border: 0 }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
        />
      </View>
    </View>
  );
}
