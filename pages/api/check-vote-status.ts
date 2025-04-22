import { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '@/amplify_outputs.json';

Amplify.configure(amplifyConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
    }
    
    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Received token in check-vote-status API route');
    
    // Parse the JWT token to get user info
    let userEmail: string;
    try {
      console.log("Attempting to parse JWT token...");
      // Properly decode Base64URL encoding of JWT payload
      const base64Payload = token.split('.')[1];
      const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const jsonPayload = Buffer.from(base64 + padding, 'base64').toString();
      console.log("JWT payload decoded to JSON:", jsonPayload.substring(0, 50) + "...");
      
      const jwtPayload = JSON.parse(jsonPayload);
      
      // Extract email from token payload
      userEmail = jwtPayload.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: 'User email not found in token' });
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Initialize Amplify API client
    const client = generateClient<Schema>();

    // Check if the user has already voted
    const existingVotes = await client.models.ExecChairVote.list({
      filter: {
        userEmail: {
          eq: userEmail,
        },
      },
    });

    if (existingVotes.data.length > 0) {
      return res.status(200).json({
        hasVoted: true,
        votedFor: existingVotes.data[0].candidateId,
        timestamp: existingVotes.data[0].timestamp,
      });
    } else {
      return res.status(200).json({
        hasVoted: false,
        votedFor: null,
      });
    }
  } catch (error) {
    console.error('Error checking vote status:', error);
    return res.status(500).json({ 
      message: 'Error checking vote status', 
      error: (error instanceof Error) ? error.message : String(error) 
    });
  }
}