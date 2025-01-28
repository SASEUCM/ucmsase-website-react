// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const ses = new SESClient({ 
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const client = generateClient<Schema>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;
    console.log('Attempting to create subscriber:', { name, email });

    // Create new subscriber
    const newSubscriber = {
      email,
      name,
      subscribeDate: new Date().toISOString(),
      isActive: true
    };

    const result = await client.models.Subscriber.create(newSubscriber);
    console.log('Subscriber created successfully:', result);

    // Send welcome email
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Welcome to SASE UC Merced Newsletter!',
        },
        Body: {
          Text: {
            Data: `Hi ${name},\n\nThank you for subscribing to SASE UC Merced's newsletter! We'll keep you updated with our latest events and announcements.\n\nBest regards,\nSASE UC Merced Team`,
          },
        },
      },
    });

    await ses.send(command);
    console.log('Welcome email sent successfully');
    
    res.status(200).json({ 
      message: 'Successfully subscribed! Check your email for confirmation.',
      status: 'success'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      message: 'Error processing subscription. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}