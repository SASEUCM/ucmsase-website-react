// pages/contact.tsx
import { View } from '@aws-amplify/ui-react';
import Contact from './components/Contact';

export default function ContactPage() {
  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <Contact />
    </View>
  );
}