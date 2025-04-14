import { View, Heading, Flex } from '@aws-amplify/ui-react';

export default function UpcomingEvents() {
  return (
    <Flex
      justifyContent="center"  // Horizontal center
      alignItems="center"      // Vertical center
      height="70vh"           // Full viewport height (optional, for vertical centering)
      backgroundColor="white" // Light background for contrast (optional)
      padding="0.05rem"
      
    >
      <View
        borderRadius="medium"
        boxShadow="medium"
        backgroundColor="white"
        
        maxWidth="900px"
        width="100%"
      >
        <Heading level={2} marginBlockEnd="1rem" textAlign="center">
          Upcoming Events
        </Heading>

        {/* Border container for iframe */}
        <div
          style={{
            borderTop: '5px solid rgb(6, 104, 179)',
            borderLeft: '5px solid rgb(6, 104, 179)',
            borderRight: '5px solid rgb(125, 194, 66)',
            borderBottom: '5px solid rgb(125, 194, 66)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <iframe
            src="https://calendar.google.com/calendar/embed?src=ucmerced%40saseconnect.org&ctz=America%2FLos_Angeles"
            style={{
              width: '100%',
              height: '450px',
              border: 'none',
            }}
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </View>
    </Flex>
  );
}
