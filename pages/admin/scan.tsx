// pages/admin/scan.tsx
import { View, Heading } from '@aws-amplify/ui-react';
import QRScanner from './../components/QRScanner';  // Make sure path is correct
import { useAuth } from './../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ScanPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="2rem">QR Code Scanner</Heading>
      <QRScanner />
    </View>
  );
}