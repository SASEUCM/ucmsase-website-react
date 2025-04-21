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
    console.log('Headers from sheet:', headers);
    
    // Create a lookup object for column indexes
    const columnIndexes = {};
    headers.forEach((header, index) => {
      const key = normalizeHeaderName(header);
      columnIndexes[key] = index;
    });
    
    console.log('Column indexes:', columnIndexes);
    
    // Map the rows to objects using the headers as keys
    const profiles = data.values.slice(1).map((row, index) => {
      // Initialize with required fields
      const profile = {
        id: `chair-${index + 1}`,
        // Make sure all fields have a valid default
        name: '', 
        year: '',
        major: '',
        photoUrl: '',
        clubs: '',
        hours: '',
        why: '',
        resumeUrl: '',
        careerAlignment: '',
        contribution: '',
        technicalSkills: '',
        achievements: ''
      };
      
      // Explicitly map each expected field using column indexes
      if (columnIndexes.name !== undefined && row[columnIndexes.name] !== undefined && row[columnIndexes.name] !== '') {
        profile.name = row[columnIndexes.name];
      }
      
      if (columnIndexes.year !== undefined && row[columnIndexes.year] !== undefined && row[columnIndexes.year] !== '') {
        profile.year = row[columnIndexes.year];
      }
      
      if (columnIndexes.major !== undefined && row[columnIndexes.major] !== undefined && row[columnIndexes.major] !== '') {
        profile.major = row[columnIndexes.major];
      }
      
      if (columnIndexes.photoUrl !== undefined && row[columnIndexes.photoUrl] !== undefined && row[columnIndexes.photoUrl] !== '') {
        profile.photoUrl = row[columnIndexes.photoUrl];
      }
      
      if (columnIndexes.clubs !== undefined && row[columnIndexes.clubs] !== undefined && row[columnIndexes.clubs] !== '') {
        profile.clubs = row[columnIndexes.clubs];
      }
      
      if (columnIndexes.hours !== undefined && row[columnIndexes.hours] !== undefined && row[columnIndexes.hours] !== '') {
        profile.hours = row[columnIndexes.hours];
      }
      
      if (columnIndexes.why !== undefined && row[columnIndexes.why] !== undefined && row[columnIndexes.why] !== '') {
        profile.why = row[columnIndexes.why];
      }
      
      if (columnIndexes.resumeUrl !== undefined && row[columnIndexes.resumeUrl] !== undefined && row[columnIndexes.resumeUrl] !== '') {
        profile.resumeUrl = row[columnIndexes.resumeUrl];
      }
      
      if (columnIndexes.careerAlignment !== undefined && row[columnIndexes.careerAlignment] !== undefined && row[columnIndexes.careerAlignment] !== '') {
        profile.careerAlignment = row[columnIndexes.careerAlignment];
      }
      
      if (columnIndexes.contribution !== undefined && row[columnIndexes.contribution] !== undefined && row[columnIndexes.contribution] !== '') {
        profile.contribution = row[columnIndexes.contribution];
      }
      
      if (columnIndexes.technicalSkills !== undefined && row[columnIndexes.technicalSkills] !== undefined && row[columnIndexes.technicalSkills] !== '') {
        profile.technicalSkills = row[columnIndexes.technicalSkills];
      }
      
      if (columnIndexes.achievements !== undefined && row[columnIndexes.achievements] !== undefined && row[columnIndexes.achievements] !== '') {
        profile.achievements = row[columnIndexes.achievements];
      }
      
      return profile;
    });
    
    // Debug raw data for the first profile
    if (profiles.length > 0) {
      console.log('First profile raw data from sheet:', data.values[1]);
      console.log('First profile processed data:', profiles[0]);
    }
    
    // Debug all profiles
    console.log('All profiles with critical fields:');
    profiles.forEach(profile => {
      console.log(`Profile #${profile.id}`);
      console.log(`Name: '${profile.name}' (${typeof profile.name})`);
      console.log(`Photo URL: '${profile.photoUrl}' (${typeof profile.photoUrl})`);
      console.log(`Hours: '${profile.hours}' (${typeof profile.hours})`);
      console.log(`Clubs: '${profile.clubs}' (${typeof profile.clubs})`);
      console.log(`Why: '${profile.why}' (${typeof profile.why})`);
      console.log(`CareerAlignment: '${profile.careerAlignment}' (${typeof profile.careerAlignment})`);
      console.log(`Contribution: '${profile.contribution}' (${typeof profile.contribution})`);
      console.log(`TechnicalSkills: '${profile.technicalSkills}' (${typeof profile.technicalSkills})`);
      console.log(`Achievements: '${profile.achievements}' (${typeof profile.achievements})`);
      console.log('---');
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
    'What other clubs/organizations are you part of on campus?': 'clubs',
    'How many hours can you spend doing sase releated work each week?': 'hours',
    'Upload your resume': 'resumeUrl',
    'Why do you want to join SASE? (100-200 Words)': 'why',
    'How does SASE align with your career goals? (100-200 Words)': 'careerAlignment',
    'What can you provide to SASE? (100-200 Words)': 'contribution',
    'What are some technical skills you have?': 'technicalSkills',
    'List your skills/awards/certifications': 'achievements'
  };
  
  // Return mapped value if exists, otherwise convert to camelCase
  return headerMap[header] || 
    header.toLowerCase().replace(/\s(.)/g, match => match.toUpperCase()).replace(/\s/g, '');
};