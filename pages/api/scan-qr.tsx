// pages/api/scan-qr.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '@/amplify_outputs.json';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

Amplify.configure(amplifyConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { barcode, pointsToAdd = 1 } = req.body;
    console.log('Received scan request:', { barcode, pointsToAdd });

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    // Find user by barcode
    const { data: users } = await client.models.UserPoints.list({
      filter: { barcode: { eq: barcode } }
    });
    console.log('Found users:', users);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found with barcode: ' + barcode });
    }

    // If multiple records exist, use the most recently updated one
    const user = users.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    
    console.log('Using points record:', user);

    // Calculate new points
    const currentPoints = user.points || 0;
    const newPoints = currentPoints + pointsToAdd;
    console.log('Points calculation:', { currentPoints, pointsToAdd, newPoints });

    // Update points
    const result = await client.models.UserPoints.update({
      id: user.id,
      points: newPoints,
      lastUpdated: new Date().toISOString()
    });
    console.log('Update result:', result);

    if (!result.data) {
      throw new Error('Failed to update points');
    }

    return res.status(200).json({
      message: 'Points updated successfully',
      currentPoints: result.data.points,
      userId: user.userId
    });

  } catch (error) {
    console.error('Error processing QR scan:', error);
    return res.status(500).json({
      message: 'Error processing scan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}