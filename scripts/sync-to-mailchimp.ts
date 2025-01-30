// scripts/sync-to-mailchimp.ts
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

async function syncSubscribersToMailchimp() {
  try {
    // 1. Get all active subscribers from your database
    const { data: subscribers } = await client.models.Subscriber.list({
      filter: {
        isActive: {
          eq: true
        }
      }
    });

    console.log(`Found ${subscribers.length} active subscribers to sync`);

    // 2. Add each subscriber to Mailchimp
    for (const subscriber of subscribers) {
      try {
        const response = await fetch(
          `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
          {
            method: 'POST',
            headers: {
              Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: subscriber.email,
              status: 'subscribed',
              merge_fields: {
                FNAME: subscriber.name?.split(' ')[0] || '',
                LNAME: subscriber.name?.split(' ').slice(1).join(' ') || '',
              },
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error syncing ${subscriber.email}:`, error.title);
          continue;
        }

        console.log(`Successfully synced ${subscriber.email} to Mailchimp`);
      } catch (error) {
        console.error(`Error processing ${subscriber.email}:`, error);
      }
    }

    console.log('Sync completed');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Run the sync
syncSubscribersToMailchimp();