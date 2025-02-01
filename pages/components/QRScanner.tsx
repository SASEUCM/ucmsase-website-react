import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Card, 
  Heading, 
  Button, 
  Flex, 
  Text,
  Alert,
  TextField,
  View
} from '@aws-amplify/ui-react';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(1);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanning = () => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanError);
    setScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log('QR Code detected, value:', decodedText);
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      console.log('Sending scan data:', { barcode: decodedText, pointsToAdd });
      const response = await fetch('/api/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: decodedText,
          pointsToAdd
        }),
      });

      const data = await response.json();
      console.log('Scan response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error processing scan');
      }

      setStatus({
        type: 'success',
        message: `Successfully added ${pointsToAdd} points! Current total: ${data.currentPoints}`
      });

      // Automatically stop scanning after successful scan
      stopScanning();
    } catch (error) {
      console.error('Scan processing error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error processing scan'
      });
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (error: string) => {
    // Only show errors that aren't related to waiting for camera permission
    if (error?.includes('NotFound')) return;
    
    console.error('QR Scan error:', error);
    setStatus({
      type: 'error',
      message: 'Error scanning QR code: ' + error
    });
  };

  return (
    <Card padding="2rem">
      <Flex direction="column" gap="1rem">
        <Heading level={3}>Scan QR Code</Heading>

        {status.type && (
          <Alert variation={status.type} isDismissible={true}>
            {status.message}
          </Alert>
        )}

        <TextField
          label="Points to Add"
          type="number"
          value={pointsToAdd.toString()}
          onChange={e => setPointsToAdd(Number(e.target.value))}
          min={1}
          step={1}
          isDisabled={loading}
        />

        <View id="qr-reader" width="100%" maxWidth="500px" margin="0 auto" />

        <Button
          onClick={scanning ? stopScanning : startScanning}
          isLoading={loading}
          loadingText="Processing..."
          variation="primary"
          className="blue-button"
        >
          {scanning ? 'Stop Scanning' : 'Start Camera'}
        </Button>

        {scanning && (
          <Text fontSize="small" textAlign="center">
            Position the QR code within the camera view
          </Text>
        )}
      </Flex>
    </Card>
  );
};

export default QRScanner;