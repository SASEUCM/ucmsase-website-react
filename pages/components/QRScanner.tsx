import React, { useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Card, 
  Heading, 
  Button, 
  Flex, 
  Text,
  Alert,
  TextField,
  View,
  SelectField,
  ToggleButton,
  ToggleButtonGroup
} from '@aws-amplify/ui-react';
import { QRCodeSVG } from 'qrcode.react';

// Get the base URL - in development vs production
const getBaseUrl = () => {
  /*
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
    */
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://main.d2w053eaz1v9cw.amplifyapp.com';
};

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(1);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'scan' | 'generate'>('scan');
  const [eventType, setEventType] = useState<string>('general');
  const [eventTitle, setEventTitle] = useState<string>('SASE Meeting');
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [useUrlRedirect, setUseUrlRedirect] = useState<boolean>(true);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);  // Track if we're currently processing a scan

  const generateEventQR = () => {
    // Create a QR code for an event
    const eventData = {
      type: 'sase-event',
      eventType,
      title: eventTitle,
      points: pointsToAdd,
      timestamp: new Date().toISOString()
    };
    
    // Convert to a QR code string
    const rawData = `SASE-EVENT:${btoa(JSON.stringify(eventData))}`;
    
    let qrData;
    if (useUrlRedirect) {
      // Create a URL that points to your website with the encoded data
      const baseUrl = getBaseUrl();
      qrData = `${baseUrl}/scan?code=${encodeURIComponent(rawData)}`;
      console.log("Generated Event QR URL:", qrData);  // Log for debugging
    } else {
      qrData = rawData;
    }
    
    setGeneratedQR(qrData);
    
    setStatus({
      type: 'success',
      message: `QR code generated! Members can scan this to earn ${pointsToAdd} points.`
    });
  };

  const startScanning = () => {
    // Reset any previous status messages
    setStatus({ type: null, message: '' });
    
    try {
      // Check if there's already an active scanner
      if (scannerRef.current) {
        stopScanning();
      }
      
      // Set scanning state to true first to update UI
      setScanning(true);
      
      // Small delay to make sure the DOM element is available
      setTimeout(() => {
        try {
          // Make sure DOM is ready for scanner
          const qrReaderElement = document.getElementById("qr-reader");
          if (!qrReaderElement) {
            throw new Error('QR reader container not found in DOM');
          }
          
          // Create a new scanner instance with proper configuration
          scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true,
            },
            false // Do not immediately render - we want to call render ourselves
          );
      
          // Manually render the scanner with our callbacks
          scannerRef.current.render(onScanSuccess, onScanError);
          console.log('Scanner rendered successfully');
          processingRef.current = false;  // Reset processing flag when starting new scan
        } catch (error) {
          console.error('Error starting scanner:', error);
          setStatus({
            type: 'error', 
            message: error instanceof Error ? error.message : 'Error starting scanner'
          });
          setScanning(false);
        }
      }, 100); // Short delay to allow React to update the DOM
    } catch (error) {
      console.error('Error starting scanner:', error);
      setStatus({
        type: 'error', 
        message: error instanceof Error ? error.message : 'Error starting scanner'
      });
      setScanning(false);
    }
  };

  const stopScanning = () => {
    try {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setScanning(false);
      processingRef.current = false;  // Reset processing flag when stopping
    } catch (error) {
      console.error('Error stopping scanner:', error);
      // Still try to reset the state
      scannerRef.current = null;
      setScanning(false);
      processingRef.current = false;
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Prevent processing multiple scans simultaneously
    if (processingRef.current || loading) {
      console.log('Already processing a scan, skipping...');
      return;
    }

    processingRef.current = true;
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      console.log('Processing scan:', { barcode: decodedText, pointsToAdd });
      
      // Check if we need to extract code from URL format
      let barcodeToProcess = decodedText;
      if (decodedText.includes('/scan?code=')) {
        try {
          const url = new URL(decodedText);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            barcodeToProcess = decodeURIComponent(codeParam);
          }
        } catch (error) {
          console.error('Error parsing URL:', error);
          // Continue with original barcode if URL parsing fails
        }
      }
      
      const response = await fetch('/api/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: barcodeToProcess,
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
      processingRef.current = false;  // Reset processing flag when done
    }
  };

  const onScanError = (error: string) => {
    // Only show errors that aren't related to waiting for camera permission
    // or routine "no QR code found" messages which happen continuously
    if (error?.includes('NotFound') || error?.includes('No QR code found')) return;
    
    console.error('QR Scan error:', error);
    setStatus({
      type: 'error',
      message: 'Error scanning QR code: ' + error
    });
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = `${eventType}-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card padding="2rem">
      <Flex direction="column" gap="1.5rem">
        <Heading level={3}>Admin QR Code Tools</Heading>

        {status.type && (
          <Alert variation={status.type} isDismissible={true}>
            {status.message}
          </Alert>
        )}

        <Flex justifyContent="center" marginBottom="1rem">
          <ToggleButtonGroup
            value={activeMode}
            isExclusive
            onChange={(value) => setActiveMode(value as 'scan' | 'generate')}
            size="large"
          >
            <ToggleButton value="scan">Scan QR Codes</ToggleButton>
            <ToggleButton value="generate">Generate Event QR</ToggleButton>
          </ToggleButtonGroup>
        </Flex>

        {activeMode === 'scan' && (
          <View>
            <Flex direction="column" gap="1rem">
              <TextField
                label="Points to Add"
                type="number"
                value={pointsToAdd.toString()}
                onChange={e => setPointsToAdd(Number(e.target.value))}
                min={1}
                step={1}
                isDisabled={loading || scanning}
              />

              {/* Explicit div for the scanner */}
              <div 
                id="qr-reader" 
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}
              ></div>

              <Button
                onClick={scanning ? stopScanning : startScanning}
                isLoading={loading}
                loadingText="Processing..."
                variation="primary"
                className="blue-button"
                isDisabled={loading}
              >
                {scanning ? 'Stop Scanning' : 'Start Camera'}
              </Button>

              {scanning && !loading && (
                <Text fontSize="small" textAlign="center">
                  Position the QR code within the camera view
                </Text>
              )}
            </Flex>
          </View>
        )}
        
        {activeMode === 'generate' && (
          <View>
            <Flex direction="column" gap="1rem">
              <SelectField
                label="Event Type"
                value={eventType}
                onChange={e => setEventType(e.target.value)}
              >
                <option value="general">General Meeting</option>
                <option value="workshop">Workshop</option>
                <option value="social">Social Event</option>
                <option value="conference">Conference</option>
                <option value="volunteering">Volunteering</option>
              </SelectField>
              
              <TextField
                label="Event Title"
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
              
              <TextField
                label="Points Value"
                type="number"
                value={pointsToAdd.toString()}
                onChange={e => setPointsToAdd(Number(e.target.value))}
                min={1}
                step={1}
              />
              
              <View backgroundColor="#f5f5f5" padding="1rem" borderRadius="medium">
                <Button
                  onClick={() => setUseUrlRedirect(!useUrlRedirect)}
                  variation={useUrlRedirect ? "primary" : "link"}
                  marginBottom="0.5rem"
                >
                  {useUrlRedirect ? "✓ URL Redirect Enabled" : "URL Redirect Disabled"}
                </Button>
                <Text fontSize="small">
                  {useUrlRedirect 
                    ? "QR code will contain a URL that opens your website. Can be scanned with any camera app." 
                    : "QR code will contain raw data. Must be scanned from within the app."}
                </Text>
              </View>
              
              <Button
                onClick={generateEventQR}
                variation="primary"
                className="blue-button"
              >
                Generate QR Code
              </Button>
              
              {generatedQR && (
                <Flex direction="column" alignItems="center" gap="1rem" margin="1.5rem 0" id="qr-canvas">
                  <View padding="1.5rem" backgroundColor="white" borderRadius="medium">
                    <QRCodeSVG 
                      value={generatedQR}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </View>
                  <Text textAlign="center">
                    Display this QR code at your event for members to scan
                  </Text>
                  <Text fontSize="small" color="gray">
                    Worth {pointsToAdd} points for &quot;{eventTitle}&quot;
                  </Text>
                  
                  <Button
                    onClick={downloadQRCode}
                    variation="link"
                    size="small"
                    marginTop="1rem"
                  >
                    Download QR Code
                  </Button>
                  
                  {useUrlRedirect && (
                    <View backgroundColor="#f5f5f5" padding="0.75rem" borderRadius="medium" margin="0.5rem 0" maxWidth="100%">
                      <Text fontSize="small" fontWeight="bold">QR Code URL:</Text>
                      <Text fontSize="small" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                        {generatedQR}
                      </Text>
                    </View>
                  )}
                </Flex>
              )}
            </Flex>
          </View>
        )}
      </Flex>
    </Card>
  );
};

export default QRScanner;