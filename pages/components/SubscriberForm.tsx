import { useState } from 'react';
import {
  View,
  Heading,
  TextField,
  Button,
  Text,
  Alert,
  useTheme,
  Flex,
  CheckboxField,
} from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

// Initialize the API client with apiKey auth mode
const client = generateClient<Schema>({
  authMode: 'apiKey'
});

export default function SubscriberForm() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subscribeToNewsletter: true
  });
  const [submitStatus, setSubmitStatus] = useState({ 
    success: false, 
    error: false,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { tokens } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting subscription:', formState);

    try {
      // Create the subscriber directly using the Amplify client
      const subscriberData = {
        email: formState.email,
        name: formState.name,
        subscribeDate: new Date().toISOString(),
        isActive: true
      };

      console.log('Creating subscriber with data:', subscriberData);
      const result = await client.models.Subscriber.create(subscriberData);
      console.log('Subscriber created:', result);

      setSubmitStatus({ 
        success: true, 
        error: false, 
        message: 'Thank you for subscribing! You\'ll receive our updates soon.'
      });
      
      setFormState({
        name: '',
        email: '',
        subscribeToNewsletter: true
      });
    } catch (error) {
      console.error('Error creating subscriber:', error);
      setSubmitStatus({ 
        success: false, 
        error: true,
        message: error instanceof Error ? error.message : 'Error processing subscription. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      borderRadius="medium"
      boxShadow="medium"
      backgroundColor="white"
      padding="2rem"
      maxWidth="800px"
      margin="0 auto"
    >
      <Heading 
        level={2} 
        marginBottom={tokens.space.medium}
        color="#1A54C4"
      >
        Stay Connected
      </Heading>
      
      <Text marginBottom={tokens.space.xl}>
        Join our mailing list to receive updates about upcoming events, opportunities, and news!
      </Text>

      {submitStatus.success && (
        <Alert
          variation="success"
          isDismissible={true}
          hasIcon={true}
          marginBottom={tokens.space.medium}
        >
          {submitStatus.message}
        </Alert>
      )}

      {submitStatus.error && (
        <Alert
          variation="error"
          isDismissible={true}
          hasIcon={true}
          marginBottom={tokens.space.medium}
        >
          {submitStatus.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={tokens.space.medium}>
          <TextField
            label="Name"
            name="name"
            value={formState.name}
            onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
            required
            size="large"
            isDisabled={loading}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formState.email}
            onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
            required
            size="large"
            isDisabled={loading}
          />

          <CheckboxField
            name="subscribeToNewsletter"
            value="yes"
            checked={formState.subscribeToNewsletter}
            onChange={e => setFormState(prev => ({ 
              ...prev, 
              subscribeToNewsletter: e.target.checked 
            }))}
            label="Subscribe to our newsletter for updates and announcements"
            isDisabled={loading}
          />

          <Button
            type="submit"
            variation="primary"
            className="blue-button"
            size="large"
            isLoading={loading}
            loadingText="Subscribing..."
          >
            Subscribe
          </Button>
        </Flex>
      </form>
    </View>
  );
}