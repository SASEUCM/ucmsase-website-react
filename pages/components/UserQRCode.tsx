import React, { useState, useEffect } from 'react';
import { Card, Heading, Text, Loader, Badge, Flex, View } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

const UserQRCode = () => {
  const [userPoints, setUserPoints] = useState<Schema['UserPoints']['type'] | null>(null);
  const [loading, setLoading] = useState(true);
  const { userEmail } = useAuth();

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
          
          setUserPoints(newUserPoints.data);
        } else {
          // Sort records by updatedAt timestamp
          const sortedRecords = response.data.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          const mostRecentRecord = sortedRecords[0];
          console.log('Most recent points record:', mostRecentRecord);
          
          // Set the most recent record first
          setUserPoints(mostRecentRecord);
          
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
              // Sort by updatedAt and use most recent
              const latestRecord = items.sort((a, b) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              )[0];
              setUserPoints(latestRecord);
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
    };
  }, [userEmail]);

  const generateQRValue = (email: string) => {
    // Generate a unique QR code value that's stable for the user
    return `SASE-${Buffer.from(email).toString('base64')}`;
  };

  if (loading) {
    return (
      <Card>
        <Flex direction="column" alignItems="center" padding="2rem">
          <Loader size="large" />
          <Text>Loading your QR code...</Text>
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
      <Flex direction="column" alignItems="center" gap="1rem">
        <Heading level={3}>Your Points Card</Heading>
        
        <Badge size="large" variation="success">
          {userPoints.points || 0} Points
        </Badge>

        <View className="qr-code-container" padding="2rem" backgroundColor="white" borderRadius="medium">
          <QRCodeSVG 
            value={userPoints.barcode || ''}
            size={256}
            level="H"
            includeMargin={true}
          />
        </View>

        <Text variation="tertiary" fontSize="small">
          Last Updated: {formatDate(userPoints.lastUpdated)}
        </Text>
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