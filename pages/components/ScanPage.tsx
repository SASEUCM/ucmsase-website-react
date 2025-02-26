// pages/scan.tsx
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  View, 
  Heading, 
  Text, 
  Loader, 
  Alert, 
  Button,
  Flex,
  Card
} from '@aws-amplify/ui-react';
import { useAuth } from '../context/AuthContext';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

const ScanPage = () => {
  const router = useRouter();
  const { isAuthenticated, userEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userPoints, setUserPoints] = useState<Schema['UserPoints']['type'] | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [processed, setProcessed] = useState(false);

  // Define processScan as a useCallback to avoid dependency warnings
  const processScan = useCallback(async (codeData: string, userBarcode: string | null | undefined) => {
    if (!userBarcode) {
      setStatus({
        type: 'error',
        message: 'Your user profile is incomplete. Please visit the profile page.'
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Determine the type of QR code
      if (codeData.startsWith('SASE-EVENT:')) {
        await processEventQR(codeData, userBarcode);
      } else if (codeData.startsWith('SASE-')) {
        await processUserQR(codeData, userBarcode);
      } else {
        throw new Error('Invalid QR code format. Not a SASE QR code.');
      }
      
      setProcessed(true);
    } catch (error) {
      console.error('Error processing scan:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error processing scan'
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  // Process scan when the page loads and the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // If not authenticated, we'll wait for the auth state to update
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      // Code param will be available after router is ready
      if (!router.isReady) return;

      const { code } = router.query;
      if (!code || typeof code !== 'string') {
        setStatus({
          type: 'error',
          message: 'Invalid QR code. Missing data.'
        });
        setLoading(false);
        return;
      }

      try {
        // First get the user's points record
        setLoading(true);
        
        // Fix: Check if userEmail is null before querying
        if (!userEmail) {
          throw new Error('User email not found. Please log in again.');
        }
        
        const response = await client.models.UserPoints.list({
          filter: { userId: { eq: userEmail } }
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Your points account not found. Please go to the profile page first.');
        }

        // Get the most recent user record
        const userRecord = response.data.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

        setUserPoints(userRecord);
        
        // Now process the scan
        await processScan(code, userRecord.barcode);
      } catch (error) {
        console.error('Error initializing scan:', error);
        setStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'An error occurred while initializing'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, router.isReady, router.query, userEmail, processScan]);

  const processUserQR = async (scannedBarcode: string, userBarcode: string) => {
    if (scannedBarcode === userBarcode) {
      throw new Error('You cannot scan your own QR code');
    }
    
    // Process points via API
    const response = await fetch('/api/claim-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userBarcode: userBarcode,
        scannedBarcode,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error processing points');
    }

    setStatus({
      type: 'success',
      message: `Successfully claimed ${data.pointsAdded} points! Current total: ${data.currentPoints}`
    });
  };

  const processEventQR = async (eventQRCode: string, userBarcode: string) => {
    // Process event QR code via API
    const response = await fetch('/api/process-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userBarcode: userBarcode,
        eventData: eventQRCode,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error processing event');
    }

    setStatus({
      type: 'success',
      message: `${data.message} (${data.pointsAdded} points earned) Current total: ${data.currentPoints}`
    });
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!isAuthenticated) {
    return (
      <View padding="2rem">
        <Card>
          <Flex direction="column" alignItems="center" padding="2rem" gap="1rem">
            <Heading level={3}>Login Required</Heading>
            <Text>Please log in to claim your points</Text>
            <Button 
              variation="primary" 
              className="blue-button"
              onClick={() => router.push('/login')}
            >
              Log In Now
            </Button>
          </Flex>
        </Card>
      </View>
    );
  }

  return (
    <View padding="2rem">
      <Card>
        <Flex direction="column" alignItems="center" padding="2rem" gap="1.5rem">
          <Heading level={3}>SASE QR Scanner</Heading>
          
          {loading || processing ? (
            <Flex direction="column" alignItems="center" gap="1rem">
              <Loader size="large" />
              <Text>{loading ? 'Initializing...' : 'Processing QR code...'}</Text>
            </Flex>
          ) : (
            <>
              {status.type && (
                <Alert variation={status.type} isDismissible={true}>
                  {status.message}
                </Alert>
              )}
              
              {processed && (
                <Flex direction="column" alignItems="center" gap="1.5rem" marginTop="1rem">
                  <Text textAlign="center">Your points have been updated!</Text>
                  
                  <Flex gap="1rem">
                    <Button
                      onClick={() => handleNavigate('/profile')}
                      variation="primary"
                    >
                      View My Profile
                    </Button>
                    
                    <Button
                      onClick={() => handleNavigate('/about')}
                      variation="link"
                    >
                      Go to Homepage
                    </Button>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </Flex>
      </Card>
    </View>
  );
};

export default ScanPage;