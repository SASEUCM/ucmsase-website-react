// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

async function addSubscriberToMailchimp(email: string, name: string) {
  // Log actual values (except full API key)
  const debugInfo = {
    serverPrefix: MAILCHIMP_SERVER_PREFIX,
    listId: MAILCHIMP_LIST_ID,
    apiKeyFirstChars: MAILCHIMP_API_KEY ? `${MAILCHIMP_API_KEY.substring(0, 6)}...` : 'not set',
    email,
    name
  };
  console.log('Mailchimp Config:', debugInfo);

  // Detailed environment check
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    const missing = {
      apiKey: !MAILCHIMP_API_KEY ? 'missing' : 'present',
      serverPrefix: !MAILCHIMP_SERVER_PREFIX ? 'missing' : MAILCHIMP_SERVER_PREFIX,
      listId: !MAILCHIMP_LIST_ID ? 'missing' : MAILCHIMP_LIST_ID,
    };
    console.error('Missing Mailchimp configuration:', missing);
    throw new Error(`Missing Mailchimp configuration: ${JSON.stringify(missing)}`);
  }

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  console.log('Attempting Mailchimp API call to URL:', url);

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

    console.log('Mailchimp API Response Status:', response.status);
    
    const responseData = await response.json();
    console.log('Mailchimp API Response:', responseData);

    if (!response.ok) {
      if (response.status === 400 && responseData.title === 'Member Exists') {
        return { status: 'already_subscribed' };
      }
      throw new Error(`Mailchimp API error: ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    // Log the full error for debugging
    console.error('Mailchimp API Error Details:', {
      error: error instanceof Error ? error.message : error,
      url,
      serverPrefix: MAILCHIMP_SERVER_PREFIX,
      listId: MAILCHIMP_LIST_ID
    });
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log all environment variables at start (except full API key)
  console.log('Environment Variables Check:', {
    MAILCHIMP_SERVER_PREFIX,
    MAILCHIMP_LIST_ID,
    MAILCHIMP_API_KEY_STATUS: MAILCHIMP_API_KEY ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;
    console.log('Processing subscription for:', { name, email });

    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required'
      });
    }

    // Try Mailchimp first
    try {
      const mailchimpResult = await addSubscriberToMailchimp(email, name);
      console.log('Mailchimp Success:', mailchimpResult);
    } catch (error) {
      // Log the full error details
      console.error('Mailchimp Error:', {
        error: error instanceof Error ? error.message : error,
        config: {
          serverPrefix: MAILCHIMP_SERVER_PREFIX,
          listId: MAILCHIMP_LIST_ID,
          hasApiKey: !!MAILCHIMP_API_KEY
        }
      });
    }

    // Try database
    try {
      const newSubscriber = {
        email,
        name,
        subscribeDate: new Date().toISOString(),
        isActive: true
      };

      const dbResult = await client.models.Subscriber.create(newSubscriber);
      console.log('Database Success:', dbResult);
    } catch (error) {
      console.error('Database Error:', error);
    }

    res.status(200).json({ 
      message: 'Successfully subscribed!',
      debug: {
        mailchimpConfig: {
          serverPrefix: MAILCHIMP_SERVER_PREFIX,
          listId: MAILCHIMP_LIST_ID,
          hasApiKey: !!MAILCHIMP_API_KEY
        }
      }
    });

  } catch (error) {
    console.error('Full subscription error:', error);
    res.status(500).json({ 
      message: 'Error processing subscription. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        mailchimpConfig: {
          serverPrefix: MAILCHIMP_SERVER_PREFIX,
          listId: MAILCHIMP_LIST_ID,
          hasApiKey: !!MAILCHIMP_API_KEY
        }
      }
    });
  }
}