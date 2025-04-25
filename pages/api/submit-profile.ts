import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey'
});

// Initialize Google Sheets API
const sheets = google.sheets('v4');

// Your Google Sheets spreadsheet ID
const SPREADSHEET_ID = '1LE9j22gEmi5oLNH7EawEA1DMn9T7C6fuoj6Uyir3YUQ';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, photo, department, year, major, quote, expertise, achievements, qualifications } = req.body;

    // Validate required fields
    if (!name || !email || !photo) {
      return res.status(400).json({ message: 'Name, email, and photo are required' });
    }

    // First, store the photo in AWS S3 (since you're using Amplify)
    const photoUrl = await storePhotoInS3(photo);

    // Prepare the row data for Google Sheets
    const rowData = [
      new Date().toISOString(), // Timestamp
      name,
      email,
      photoUrl,
      department || '',
      year || '',
      major || '',
      quote || '',
      expertise || '',
      achievements || '',
      qualifications || ''
    ];

    // Append the row to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Form Responses 1!A:K', // Adjust range based on your sheet structure
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      },
      auth: new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      }),
    });

    res.status(200).json({ 
      message: 'Profile submitted successfully',
      photoUrl
    });

  } catch (error) {
    console.error('Error submitting profile:', error);
    res.status(500).json({ 
      message: 'Error submitting profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function storePhotoInS3(photo: string): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  
  // Generate a unique filename
  const filename = `profiles/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  
  // Upload to S3 using Amplify Storage
  const result = await client.storage.put(filename, buffer, {
    contentType: 'image/jpeg',
    level: 'public'
  });
  
  return result.url;
} 