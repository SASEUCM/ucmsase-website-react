// googleSheetsService.js
const SHEETS_API_KEY = 'AIzaSyAjz7rKp08q4i2KEwuhfvbBtwfV-gVp3FI'; // Your API key
const SPREADSHEET_ID = '1LE9j22gEmi5oLNH7EawEA1DMn9T7C6fuoj6Uyir3YUQ'; // Your spreadsheet ID
const SHEET_GID = '1679596791'; // Sheet GID from the URL

/**
 * Fetches the sheet name corresponding to a sheet GID
 * @param {string} gid - The GID of the sheet to lookup
 * @returns {Promise<string>} Sheet name
 */
export const getSheetNameFromGid = async (gid) => {
  try {
    // First, get the spreadsheet metadata which includes info about all sheets
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${SHEETS_API_KEY}`;
    
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.sheets || data.sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    // Find the sheet with the matching GID
    const targetSheet = data.sheets.find(
      sheet => sheet.properties && sheet.properties.sheetId.toString() === gid
    );
    
    if (!targetSheet) {
      throw new Error(`Sheet with GID ${gid} not found`);
    }
    
    return targetSheet.properties.title;
  } catch (error) {
    console.error('Error fetching sheet name from GID:', error);
    throw error;
  }
};

/**
 * Fetches executive chair profiles from a Google Sheet using GID
 * @returns {Promise<Array>} Array of profile objects
 */
export const fetchProfiles = async () => {
  try {
    // First get the sheet name corresponding to the GID
    const sheetName = await getSheetNameFromGid(SHEET_GID);
    
    // Then use the sheet name in the values API call
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:Z1000?key=${SHEETS_API_KEY}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length < 2) {
      throw new Error('No data found in the Google Sheet or invalid format');
    }
    
    // The first row contains headers
    const headers = data.values[0];
    
    // Map the rows to objects using the headers as keys
    const profiles = data.values.slice(1).map((row, index) => {
      const profile = {
        id: `chair-${index + 1}`,
      };
      
      // Map each column value to its corresponding header
      headers.forEach((header, i) => {
        // Normalize header names to camelCase
        const key = normalizeHeaderName(header);
        profile[key] = row[i] || ''; // Use empty string as fallback
      });
      
      return profile;
    });
    
    return profiles;
  } catch (error) {
    console.error('Error fetching profiles from Google Sheets:', error);
    throw error;
  }
};

/**
 * Normalizes header names to consistent camelCase format
 * @param {string} header - The header name from the spreadsheet
 * @returns {string} Normalized header name
 */
const normalizeHeaderName = (header) => {
  // Handle form response headers based on your Google Form
  const headerMap = {
    'Timestamp': 'timestamp',
    'What is your name?': 'name',
    'Upload a picture of yourself': 'photoUrl',
    'What year are you?': 'year',
    'What is your major?': 'major',
    'What other clubs/organizations are you part of?': 'clubs',
    'How many hours can you spend doing club-work per week?': 'hours',
    'Upload your resume': 'resumeUrl',
    'Why do you want to join?': 'why'
  };
  
  // Return mapped value if exists, otherwise convert to camelCase
  return headerMap[header] || 
    header.toLowerCase().replace(/\s(.)/g, match => match.toUpperCase()).replace(/\s/g, '');
};