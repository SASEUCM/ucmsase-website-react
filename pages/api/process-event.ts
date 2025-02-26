// pages/api/process-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '@/amplify_outputs.json';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

Amplify.configure(amplifyConfig);

interface EventRequest {
  userBarcode: string; // The barcode of the user scanning the event
  eventData: string;   // The encoded event data
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userBarcode, eventData }: EventRequest = req.body;
    console.log('Received event scan request:', { userBarcode, eventData });

    if (!userBarcode || !eventData) {
      return res.status(400).json({ message: 'Both userBarcode and eventData are required' });
    }

    // Find the user who is scanning
    const { data: scanningUsers } = await client.models.UserPoints.list({
      filter: { barcode: { eq: userBarcode } }
    });
    
    if (!scanningUsers || scanningUsers.length === 0) {
      return res.status(404).json({ message: 'Your user account could not be found' });
    }

    // Decode event data
    let decodedEventData;
    try {
      // Remove the prefix and decode
      const encodedJson = eventData.replace('SASE-EVENT:', '');
      decodedEventData = JSON.parse(atob(encodedJson));
      
      // Validate it's a SASE event
      if (decodedEventData.type !== 'sase-event') {
        throw new Error('Invalid event format');
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid event QR code format' });
    }

    // Get the user record
    const scanningUser = scanningUsers.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    
    // Calculate points to add from the event
    const pointsToAdd = decodedEventData.points || 1;
    
    // Update user's points
    const currentPoints = scanningUser.points || 0;
    const newPoints = currentPoints + pointsToAdd;
    
    // Update in database
    const result = await client.models.UserPoints.update({
      id: scanningUser.id,
      points: newPoints,
      lastUpdated: new Date().toISOString()
    });

    if (!result.data) {
      throw new Error('Failed to update points');
    }

    return res.status(200).json({
      message: `Points earned for attending "${decodedEventData.title}"`,
      eventTitle: decodedEventData.title,
      pointsAdded: pointsToAdd,
      currentPoints: result.data.points,
      userId: scanningUser.userId
    });

  } catch (error) {
    console.error('Error processing event:', error);
    return res.status(500).json({
      message: 'Error processing event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}