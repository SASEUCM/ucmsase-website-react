// pages/profile.tsx
import { View, Heading } from '@aws-amplify/ui-react';
import UserQRCode from './components/UserQRCode';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <View padding="2rem" borderRadius="medium">
      <Heading level={2} marginBottom="2rem">My Profile</Heading>
      <UserQRCode />
    </View>
  );
}