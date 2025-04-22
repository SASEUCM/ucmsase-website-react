import { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '@/amplify_outputs.json';

Amplify.configure(amplifyConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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
    console.log('Received token in cast-vote API route');
    
    // Parse the JWT token to get user info
    let userEmail: string;
    try {
      console.log("Attempting to parse JWT token in cast-vote...");
      // Properly decode Base64URL encoding of JWT payload
      const base64Payload = token.split('.')[1];
      const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - base64.length % 4) % 4);
      const jsonPayload = Buffer.from(base64 + padding, 'base64').toString();
      console.log("JWT payload decoded to JSON in cast-vote:", jsonPayload.substring(0, 50) + "...");
      
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

    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: 'Missing required field: candidateId' });
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
      return res.status(400).json({ 
        message: 'You have already voted',
        voteInfo: {
          candidateId: existingVotes.data[0].candidateId,
          timestamp: existingVotes.data[0].timestamp,
        }
      });
    }

    // Record the new vote
    const newVote = await client.models.ExecChairVote.create({
      userEmail,
      candidateId,
      timestamp: new Date().toISOString(),
    });

    // Update the vote summary (for admin dashboard)
    try {
      // Try to get existing summary
      const summaryResults = await client.models.VoteSummary.list({
        filter: {
          candidateId: {
            eq: candidateId,
          }
        }
      });

      if (summaryResults.data.length > 0) {
        // Update existing summary
        const summary = summaryResults.data[0];
        await client.models.VoteSummary.update({
          id: summary.id,
          voteCount: (summary.voteCount || 0) + 1,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Create new summary
        await client.models.VoteSummary.create({
          candidateId,
          voteCount: 1,
          candidateName: '', // This would be populated from profile data in a real implementation
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating vote summary:', error);
      // Don't fail the vote if summary update fails
    }

    return res.status(201).json({ 
      message: 'Vote recorded successfully',
      vote: newVote
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ message: 'Error recording vote', error: (error instanceof Error) ? error.message : String(error) });
  }
}