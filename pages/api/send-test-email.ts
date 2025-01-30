// pages/api/send-test-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const ses = new SESClient({ 
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const client = generateClient<Schema>();

async function isUserAdmin(req: NextApiRequest): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const groups = user.signInDetails?.cognitoUserGroups || [];
    return groups.includes('admin');
  } catch (error) {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify user is admin
    const admin = await isUserAdmin(req);
    if (!admin) {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    // Fetch all active subscribers
    const result = await client.models.Subscriber.list({
      filter: {
        isActive: {
          eq: true
        }
      }
    });

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({ message: 'No active subscribers found' });
    }

    // Send test email to each subscriber
    const emailPromises = result.data.map(subscriber => {
      const command = new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [subscriber.email!],
        },
        Message: {
          Subject: {
            Data: 'Test Email from SASE UC Merced',
          },
          Body: {
            Text: {
              Data: `Hello ${subscriber.name},\n\nThis is a test email from the SASE UC Merced newsletter system.\n\nBest regards,\nSASE UC Merced Team`,
            },
          },
        },
      });

      return ses.send(command);
    });

    await Promise.all(emailPromises);
    
    res.status(200).json({ 
      message: `Successfully sent test emails to ${result.data.length} subscribers`,
      recipientCount: result.data.length
    });

  } catch (error) {
    console.error('Error sending test emails:', error);
    res.status(500).json({ 
      message: 'Error sending test emails',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}