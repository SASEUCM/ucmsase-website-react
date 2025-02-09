// pages/schedule.tsx
import { View, Heading } from '@aws-amplify/ui-react';
import SchedulePlanner from './components/SchedulePlanner';
import AdminSchedulePlanner from './components/AdminSchedulePlanner';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SchedulePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
      padding="2rem"
    >
      <Heading level={2} marginBottom="2rem">
        {isAdmin ? "Schedule Management" : "My Schedule"}
      </Heading>
      
      {isAdmin ? (
        <AdminSchedulePlanner />
      ) : (
        <SchedulePlanner />
      )}
    </View>
  );
}