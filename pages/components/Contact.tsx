// components/Contact.tsx
import { useState } from 'react';
import {
  View,
  Heading,
  TextField,
  TextAreaField,
  Button,
  useTheme,
} from '@aws-amplify/ui-react';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { tokens } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formState);
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
        marginBottom={tokens.space.xl}
        color="#1A54C4"
      >
        Contact Us
      </Heading>

      <form onSubmit={handleSubmit}>
        <View marginBottom={tokens.space.large}>
          <TextField
            label="Name:"
            name="name"
            value={formState.name}
            onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
            required
            size="large"
          />
        </View>

        <View marginBottom={tokens.space.large}>
          <TextField
            label="Email:"
            name="email"
            type="email"
            value={formState.email}
            onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
            required
            size="large"
          />
        </View>

        <View marginBottom={tokens.space.large}>
          <TextAreaField
            label="Message:"
            name="message"
            value={formState.message}
            onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
            required
            rows={6}
            size="large"
          />
        </View>

        <Button
          type="submit"
          variation="primary"
          className="blue-button"
          size="large"
        >
          Send
        </Button>
      </form>
    </View>
  );
}