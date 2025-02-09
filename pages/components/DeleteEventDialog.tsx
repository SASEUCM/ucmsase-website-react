import React from 'react';
import {
  View,
  Heading,
  Button,
  Flex,
} from '@aws-amplify/ui-react';

interface DeleteEventDialogProps {
  onClose: () => void;
  onDelete: (type: 'single' | 'series') => void;
  event: any;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  onClose,
  onDelete,
  event,
}) => {
  return (
    <Flex
      // Move unsupported props (zIndex, position, etc.) into style
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      // These flex-specific props are allowed on the Flex component
      justifyContent="center"
      alignItems="center"
    >
      <View
        backgroundColor="white"
        padding="2rem"
        borderRadius="medium"
        maxWidth="400px"
        width="90%"
      >
        <Heading level={3} marginBottom="1.5rem">
          Delete Event
        </Heading>

        <Flex direction="column" gap="1rem">
          <Button
            onClick={() => onDelete('single')}
            variation="destructive"
          >
            Delete this event
          </Button>

          {event?.extendedProps?.isRecurring && (
            <Button
              onClick={() => onDelete('series')}
              variation="destructive"
            >
              Delete this and following events
            </Button>
          )}

          <Button
            onClick={onClose}
            variation="link"
          >
            Cancel
          </Button>
        </Flex>
      </View>
    </Flex>
  );
};

export default DeleteEventDialog;
