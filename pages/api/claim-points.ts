// pages/api/claim-points.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '@/amplify_outputs.json';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

Amplify.configure(amplifyConfig);

interface ScanRequest {
  userBarcode: string; // The barcode of the user who's scanning
  scannedBarcode: string; // The barcode being scanned
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userBarcode, scannedBarcode }: ScanRequest = req.body;
    console.log('Received claim request:', { userBarcode, scannedBarcode });

    if (!userBarcode || !scannedBarcode) {
      return res.status(400).json({ message: 'Both userBarcode and scannedBarcode are required' });
    }

    // Validate the barcodes are different - users can't scan their own code
    if (userBarcode === scannedBarcode) {
      return res.status(400).json({ message: 'You cannot scan your own QR code' });
    }

    // Find the owner of the scanned barcode - this is for validation
    const { data: scannedUsers } = await client.models.UserPoints.list({
      filter: { barcode: { eq: scannedBarcode } }
    });
    
    if (!scannedUsers || scannedUsers.length === 0) {
      return res.status(404).json({ message: 'Invalid QR code - user not found' });
    }

    // Find the user who is scanning
    const { data: scanningUsers } = await client.models.UserPoints.list({
      filter: { barcode: { eq: userBarcode } }
    });
    
    if (!scanningUsers || scanningUsers.length === 0) {
      return res.status(404).json({ message: 'Your user account could not be found' });
    }

    // Get the user record
    const scanningUser = scanningUsers.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    // Calculate the points to add (constant for now, could be dynamic later)
    const pointsToAdd = 1;
    
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
      message: 'Points claimed successfully',
      pointsAdded: pointsToAdd,
      currentPoints: result.data.points,
      userId: scanningUser.userId
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    return res.status(500).json({
      message: 'Error processing claim',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}