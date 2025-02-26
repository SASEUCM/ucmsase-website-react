import React, { useState, useEffect, useRef } from 'react';
import { Card, Heading, Text, Loader, Badge, Flex, View, Button, Alert } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// Get the base URL - in development vs production
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://main.d2w053eaz1v9cw.amplifyapp.com/';
};

const UserQRCode = () => {
  const [userPoints, setUserPoints] = useState<Schema['UserPoints']['type'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [scanningLoading, setScanningLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const { userEmail } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    let subscription: any;

    const initializeUserPoints = async () => {
      if (!userEmail) return;
      
      try {
        console.log('Initializing points for user:', userEmail);
        
        // Try to fetch existing user points
        const response = await client.models.UserPoints.list({
          filter: { userId: { eq: userEmail } }
        });
        console.log('Fetch response:', response);

        if (!response.data || response.data.length === 0) {
          console.log('No existing points record, creating new one');
          const barcode = generateQRValue(userEmail);
          console.log('Generated barcode:', barcode);
          
          // Create new user points record
          const newUserPoints = await client.models.UserPoints.create({
            userId: userEmail,
            points: 0,
            barcode,
            lastUpdated: new Date().toISOString()
          });
          console.log('Created new points record:', newUserPoints);
          
          if (newUserPoints.data) {
            setUserPoints(newUserPoints.data);
            generateQrUrl(newUserPoints.data.barcode);
          } else {
            console.error('Failed to create user points record');
          }
        } else {
          // Sort records by updatedAt timestamp
          const sortedRecords = response.data.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          const mostRecentRecord = sortedRecords[0];
          console.log('Most recent points record:', mostRecentRecord);
          
          setUserPoints(mostRecentRecord);
          generateQrUrl(mostRecentRecord.barcode);
          
          // Clean up duplicates in the background
          if (sortedRecords.length > 1) {
            console.log('Found duplicate records, cleaning up...');
            for (let i = 1; i < sortedRecords.length; i++) {
              try {
                await client.models.UserPoints.delete({
                  id: sortedRecords[i].id
                });
                console.log('Deleted duplicate record:', sortedRecords[i].id);
              } catch (error) {
                console.error('Error deleting duplicate record:', error);
              }
            }
          }
        }

        // Set up subscription after initial data is loaded
        subscription = client.models.UserPoints.observeQuery({
          filter: { userId: { eq: userEmail } }
        }).subscribe({
          next: ({ items }) => {
            if (items && items.length > 0) {
              // Sort by updatedAt and use the most recent
              const latestRecord = items.sort((a, b) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              )[0];
              setUserPoints(latestRecord);
              generateQrUrl(latestRecord.barcode);
            }
          },
          error: (error) => console.error('Subscription error:', error)
        });

      } catch (error) {
        console.error('Error managing user points:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUserPoints();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      stopScanning();
    };
  }, [userEmail]);

  const generateQRValue = (email: string) => {
    // Generate a unique QR code value that's stable for the user
    return `SASE-${Buffer.from(email).toString('base64')}`;
  };

  const generateQrUrl = (barcode: string | null | undefined) => {
    if (!barcode) return;
    
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/scan?code=${encodeURIComponent(barcode)}`;
    setQrUrl(url);
  };

  const startScanning = () => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    scannerRef.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      onScanSuccess,
      onScanError
    );
    
    setScanning(true);
    processingRef.current = false;
    setStatus({ type: null, message: '' });
  };

  const stopScanning = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(error => {
        console.error('Error stopping scanner:', error);
      });
    }
    scannerRef.current = null;
    setScanning(false);
    processingRef.current = false;
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processingRef.current || scanningLoading) {
      console.log('Already processing a scan, skipping...');
      return;
    }
    
    processingRef.current = true;
    setScanningLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      console.log('QR code scanned:', decodedText);
      
      let codeData = decodedText;
      
      // If it's a URL, extract ?code=
      if (decodedText.includes('/scan?code=')) {
        const url = new URL(decodedText);
        const codeParam = url.searchParams.get('code');
        if (codeParam) {
          codeData = decodeURIComponent(codeParam);
        }
      }
      
      // Decide if event or user QR code
      if (codeData.startsWith('SASE-EVENT:')) {
        await processEventQR(codeData);
      } else if (codeData.startsWith('SASE-')) {
        if (codeData === userPoints?.barcode) {
          throw new Error('You cannot scan your own QR code');
        }
        await processUserQR(codeData);
      } else {
        throw new Error('Invalid QR code - not a SASE QR code');
      }

      // Stop scanning on success
      stopScanning();
    } catch (error) {
      console.error('Scan processing error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error processing scan'
      });
      processingRef.current = false;
    } finally {
      setScanningLoading(false);
    }
  };

  const processUserQR = async (scannedBarcode: string) => {
    // Process points
    const response = await fetch('/api/claim-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userBarcode: userPoints?.barcode,
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

  const processEventQR = async (eventQRCode: string) => {
    const response = await fetch('/api/process-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userBarcode: userPoints?.barcode,
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

  const onScanError = (error: string) => {
    // Ignore camera permission or "NotFound" spam
    if (error?.includes('NotFound')) return;

    console.error('QR Scan error:', error);
    setStatus({
      type: 'error',
      message: 'Error scanning QR code: ' + error
    });
  };
  
  const downloadQRCode = () => {
    const canvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `sase-points-${userEmail?.split('@')[0] || 'user'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <Flex direction="column" alignItems="center" padding="2rem">
          <Loader size="large" />
          <Text>Loading your points...</Text>
        </Flex>
      </Card>
    );
  }

  if (!userPoints) {
    return (
      <Card>
        <Text>Unable to load user points</Text>
      </Card>
    );
  }

  return (
    <Card padding="2rem">
      <Flex direction="column" alignItems="center" gap="1.5rem">
        <Heading level={3}>Your SASE Points</Heading>
        
        <Badge size="large" variation="success">
          {userPoints.points || 0} Points
        </Badge>

        {status.type && (
          <Alert variation={status.type} isDismissible={true}>
            {status.message}
          </Alert>
        )}

        {!scanning ? (
          <Flex direction="column" alignItems="center" gap="1rem">
            <Text textAlign="center">
              Scan event QR codes or other members&apos; QR codes to earn points
            </Text>
            
            <View
              id="qr-canvas"
              className="qr-code-container"
              padding="2rem"
              backgroundColor="white"
              borderRadius="medium"
            >
              <QRCodeSVG
                value={qrUrl || userPoints.barcode || ''}
                size={256}
                level="H"
                includeMargin={true}
              />
            </View>
            
            <Text fontSize="small" textAlign="center">
              Have others scan your QR code to earn points
            </Text>
            
            <Button
              onClick={downloadQRCode}
              variation="link"
              size="small"
            >
              Download My QR Code
            </Button>
            
            <Button
              onClick={startScanning}
              variation="primary"
              className="blue-button"
              size="large"
              marginTop="1.5rem"
            >
              Start Scanning
            </Button>
            
            <Text fontSize="small" textAlign="center">
              Last Updated: {formatDate(userPoints.lastUpdated)}
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" alignItems="center" gap="1rem" width="100%">
            <View id="qr-reader" width="100%" maxWidth="500px" margin="0 auto" />
            
            <Button
              onClick={stopScanning}
              isLoading={scanningLoading}
              loadingText="Processing..."
              variation="primary"
              className="blue-button"
              isDisabled={scanningLoading}
            >
              Stop Scanning
            </Button>

            {!scanningLoading && (
              <Text fontSize="small" textAlign="center">
                Scan a member&apos;s QR code or event QR code
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Never';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export default UserQRCode;
