// components/ScanPage.tsx
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
  const { isAuthenticated, userEmail, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userPoints, setUserPoints] = useState<Schema['UserPoints']['type'] | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [processed, setProcessed] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  console.log("Scan page loaded, router query:", router.query); // Debugging

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
      
      // Extract code from URL if needed
      let processedCodeData = codeData;
      if (codeData.startsWith('http') && codeData.includes('/scan?code=')) {
        try {
          const url = new URL(codeData);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            processedCodeData = decodeURIComponent(codeParam);
          }
        } catch (error) {
          console.error('Error parsing URL in code data:', error);
          // Continue with original string if parsing fails
        }
      }
      
      console.log('Processing code data:', processedCodeData);
      
      // Determine the type of QR code
      if (processedCodeData.startsWith('SASE-EVENT:')) {
        await processEventQR(processedCodeData, userBarcode);
      } else if (processedCodeData.startsWith('SASE-')) {
        await processUserQR(processedCodeData, userBarcode);
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

  // Check for redirects from another page (like AppContent in _app.tsx)
  useEffect(() => {
    // Specifically listen for redirects that might come from higher-level layouts
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // If we're in the middle of showing results, prevent automatic redirects
      if (processed && !autoRedirecting) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [processed, autoRedirecting]);

  // Process scan when the page loads and the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Code param will be available after router is ready
      if (!router.isReady) return;

      // If not authenticated, preserve the code parameter for after login
      if (!isAuthenticated) {
        // Get the code param to preserve it
        const { code } = router.query;
        if (code && typeof code === 'string') {
          // Store code in sessionStorage before redirecting to login
          sessionStorage.setItem('pendingScanCode', code);
          console.log('Saved code to sessionStorage for after login:', code);
        }
        setLoading(false);
        return;
      }

      // After login, first check if we have a stored code from before login
      let codeToProcess = router.query.code;
      const storedCode = sessionStorage.getItem('pendingScanCode');
      
      if (!codeToProcess && storedCode) {
        console.log('Retrieved stored code from session:', storedCode);
        codeToProcess = storedCode;
        // Clear the stored code so we don't process it again
        sessionStorage.removeItem('pendingScanCode');
        
        // If we're using the stored code instead of the URL param, update the URL
        // This is optional but keeps the URL in sync with what we're processing
        if (!router.query.code && typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?code=${encodeURIComponent(storedCode)}`;
          router.replace(newUrl, undefined, { shallow: true });
        }
      }

      if (!codeToProcess || typeof codeToProcess !== 'string') {
        setStatus({
          type: 'error',
          message: 'Invalid QR code. Missing data.'
        });
        setLoading(false);
        return;
      }

      console.log("Processing code:", codeToProcess); // Debugging

      try {
        // First get the user's points record
        setLoading(true);
        
        // Check if userEmail is null before querying
        if (!userEmail) {
          throw new Error('User email not found. Please log in again.');
        }
        
        console.log('Fetching user points for', userEmail);
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
        console.log('Found user record with barcode:', userRecord.barcode);
        
        // Now process the scan
        await processScan(codeToProcess, userRecord.barcode);
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
  }, [isAuthenticated, router.isReady, router.query, userEmail, processScan, router]);

  const processUserQR = async (scannedBarcode: string, userBarcode: string) => {
    console.log('Processing user QR code');
    
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
    console.log('Processing event QR code');
    
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

  // Only navigate after user explicitly clicks a button
  const handleNavigate = (path: string) => {
    // Set flag to indicate we're performing a user-initiated redirect
    setAutoRedirecting(true);
    router.push(path);
  };

  const handleLogin = () => {
    // The code parameter will be saved to sessionStorage in the useEffect
    router.push('/login');
  };

  if (!isAuthenticated) {
    // Show login prompt with message about pending scan
    return (
      <View padding="2rem">
        <Card>
          <Flex direction="column" alignItems="center" padding="2rem" gap="1rem">
            <Heading level={3}>Login Required</Heading>
            <Text>Please log in to process this QR code and claim your points</Text>
            <Button 
              variation="primary" 
              className="blue-button"
              onClick={handleLogin}
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