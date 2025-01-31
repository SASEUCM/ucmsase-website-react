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
  // Log config for debugging
  console.log('Mailchimp Config:', {
    serverPrefix: MAILCHIMP_SERVER_PREFIX,
    listId: MAILCHIMP_LIST_ID,
    apiKeyPresent: !!MAILCHIMP_API_KEY
  });

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    const missing = {
      apiKey: !MAILCHIMP_API_KEY,
      serverPrefix: !MAILCHIMP_SERVER_PREFIX,
      listId: !MAILCHIMP_LIST_ID,
    };
    throw new Error(`Missing Mailchimp configuration: ${JSON.stringify(missing)}`);
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  const responseData = await response.json();
  console.log('Mailchimp API response:', responseData);

  if (!response.ok) {
    if (response.status === 400 && responseData.title === 'Member Exists') {
      return { status: 'already_subscribed' };
    }
    throw new Error(`Mailchimp API error: ${JSON.stringify(responseData)}`);
  }

  return responseData;
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

    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required'
      });
    }

    // Try Mailchimp first
    let mailchimpSuccess = false;
    try {
      const mailchimpResult = await addSubscriberToMailchimp(email, name);
      mailchimpSuccess = true;
      console.log('Mailchimp subscription successful:', mailchimpResult);
    } catch (error) {
      console.error('Mailchimp subscription failed:', error);
      // Throw the error to be caught by outer try-catch
      throw error;
    }

    // Only proceed with database if Mailchimp succeeded
    if (mailchimpSuccess) {
      try {
        const newSubscriber = {
          email,
          name,
          subscribeDate: new Date().toISOString(),
          isActive: true
        };

        const dbResult = await client.models.Subscriber.create(newSubscriber);
        console.log('Database subscription successful:', dbResult);

        res.status(200).json({ 
          message: 'Successfully subscribed to our newsletter!',
          status: 'success'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still consider it a success if Mailchimp worked but DB failed
        res.status(207).json({
          message: 'Partially subscribed - you will receive email confirmations',
          status: 'partial_success'
        });
      }
    }

  } catch (error) {
    console.error('Subscription error:', error);
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