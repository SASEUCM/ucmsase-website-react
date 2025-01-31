// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

// Initialize the client with apiKey auth mode
const client = generateClient<Schema>({
  authMode: 'apiKey'
});

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

async function addSubscriberToMailchimp(email: string, name: string) {
  console.log('Starting Mailchimp API call with:', {
    serverPrefix: MAILCHIMP_SERVER_PREFIX,
    listId: MAILCHIMP_LIST_ID,
    email,
    name
  });

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    throw new Error('Missing required Mailchimp configuration');
  }

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  console.log('Mailchimp API URL:', url);

  const data = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: name.split(' ')[0] || '',
      LNAME: name.split(' ').slice(1).join(' ') || ''
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('Mailchimp API response status:', response.status);
    
    const responseData = await response.json();
    console.log('Mailchimp API response:', responseData);

    if (!response.ok) {
      // Handle "Member Exists" case
      if (response.status === 400 && responseData.title === 'Member Exists') {
        console.log('Subscriber already exists in Mailchimp');
        return { status: 'already_subscribed' };
      }
      
      throw new Error(`Mailchimp API error: ${responseData.title} - ${responseData.detail}`);
    }

    return responseData;
  } catch (error) {
    console.error('Error in Mailchimp API call:', error);
    throw error;
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
    const { name, email } = req.body;
    console.log('Processing subscription for:', { name, email });

    // Validate inputs
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required'
      });
    }

    // First try to add to Mailchimp
    const mailchimpResult = await addSubscriberToMailchimp(email, name);
    console.log('Mailchimp subscription result:', mailchimpResult);

    // If successful or already subscribed, add/update in database
    try {
      const newSubscriber = {
        email,
        name,
        subscribeDate: new Date().toISOString(),
        isActive: true
      };

      const dbResult = await client.models.Subscriber.create(newSubscriber);
      console.log('Database subscription result:', dbResult);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Even if database fails, we'll still return success if Mailchimp worked
    }

    // Determine appropriate success message
    const message = mailchimpResult.status === 'already_subscribed'
      ? 'You are already subscribed to our newsletter!'
      : 'Successfully subscribed to our newsletter!';

    res.status(200).json({ 
      message,
      status: 'success'
    });

  } catch (error) {
    console.error('Full subscription error:', error);
    res.status(500).json({ 
      message: 'Error processing subscription. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}