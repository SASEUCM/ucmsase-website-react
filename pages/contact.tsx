// pages/contact.tsx
import { View } from '@aws-amplify/ui-react';
import SubscriberForm from './components/SubscriberForm';

export default function ContactPage() {
  return (
    <View
      as="main"
      borderRadius="medium"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      {/* Background image with blur */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/standingonbusiness.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.7)',
          zIndex: -1,
          transform: 'scale(1.1)' // Prevents blur edges from showing
        }}
      />
      <SubscriberForm />
    </View>
  );
}