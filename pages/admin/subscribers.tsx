// pages/admin/subscribers.tsx
import { useEffect } from 'react';
import { View } from '@aws-amplify/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SubscriberList from '../components/SubscriberList';

export default function AdminSubscribersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/about');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <SubscriberList />
    </View>
  );
}