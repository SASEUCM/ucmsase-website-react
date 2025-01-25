// pages/admin/index.tsx
import React from 'react';
import { View } from '@aws-amplify/ui-react';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AdminPage: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <View
      as="main"
      backgroundColor="#f5f5f5"
      minHeight="100vh"
    >
      <AdminDashboard />
    </View>
  );
};

export default AdminPage;