// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1LE9j22gEmi5oLNH7EawEA1DMn9T7C6fuoj6Uyir3YUQ',
  FORM_ID: '1tqBYTZ73YK9pQPVttVcJUwB2nHMtOlssrmSKCdMRNU',
  AUTHORIZED_USERS: [
    'ucmerced@saseconnect.org',
    'addisonxchen@gmail.com'
  ]
};

/**
 * Main function triggered when form is submitted
 */
function onFormSubmit(e) {
  if (!e || !e.response) {
    Logger.log('Error: Invalid event object');
    return;
  }

  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Extract form data
    const formData = extractFormData(itemResponses);
    
    if (!formData.fileId) {
      Logger.log('No file uploaded in form submission');
      return;
    }

    // Process the uploaded file
    processUploadedFile(formData);
    
    Logger.log('Form submission processed successfully');
  } catch (error) {
    Logger.log('Error processing form submission: ' + error.toString());
  }
}

/**
 * Extract form data from responses
 */
function extractFormData(itemResponses) {
  const data = {
    fileId: null,
    email: null
  };

  for (const item of itemResponses) {
    const title = item.getItem().getTitle();
    const response = item.getResponse();
    
    if (title === 'Upload your photo') {
      data.fileId = response;
    } else if (title === 'Email') {
      data.email = response;
    }
  }

  return data;
}

/**
 * Process the uploaded file
 */
function processUploadedFile(formData) {
  const file = DriveApp.getFileById(formData.fileId);
  
  // Share with authorized users
  shareFileWithUsers(file, CONFIG.AUTHORIZED_USERS);
  
  // Share with form respondent if email was provided
  if (formData.email) {
    file.addViewer(formData.email);
  }
  
  // Store the file URL in spreadsheet
  storeFileUrlInSpreadsheet(file.getUrl());
}

/**
 * Share file with list of users
 */
function shareFileWithUsers(file, users) {
  users.forEach(email => {
    try {
      file.addViewer(email);
    } catch (error) {
      Logger.log(`Error sharing file with ${email}: ${error.toString()}`);
    }
  });
}

/**
 * Store file URL in spreadsheet
 */
function storeFileUrlInSpreadsheet(fileUrl) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Form Responses 1');
  const lastRow = sheet.getLastRow();
  
  // Find or create Photo URL column
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let photoUrlColumnIndex = headers.indexOf('Photo URL') + 1;
  
  if (photoUrlColumnIndex === 0) {
    photoUrlColumnIndex = sheet.getLastColumn() + 1;
    sheet.getRange(1, photoUrlColumnIndex).setValue('Photo URL');
  }
  
  // Store URL in the last row
  sheet.getRange(lastRow, photoUrlColumnIndex).setValue(fileUrl);
}

/**
 * Handle HTTP GET requests to serve the data
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const profiles = getAllProfiles();
    output.setContent(JSON.stringify(profiles));
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    output.setContent(JSON.stringify({
      error: true,
      message: error.toString()
    }));
  }
  
  return output;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Get all profiles from the spreadsheet
 */
function getAllProfiles() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Form Responses 1');
  
  if (!sheet) {
    throw new Error("Sheet 'Form Responses 1' not found");
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const photoUrlIndex = headers.indexOf('Photo URL');
  
  return data.slice(1).map((row, index) => {
    const profile = {
      ID: `chair-${index + 1}`,
      Timestamp: new Date().toISOString()
    };
    
    headers.forEach((header, i) => {
      if (header) {
        const propertyName = getPropertyName(header);
        profile[propertyName] = row[i] || '';
      }
    });
    
    if (photoUrlIndex >= 0) {
      profile['PhotoUrl'] = row[photoUrlIndex] || '';
      profile['Photo URL'] = row[photoUrlIndex] || '';
    }
    
    return profile;
  });
}

/**
 * Map form field names to profile property names
 */
function getPropertyName(header) {
  const mappings = {
    'Full Name': 'Name',
    'Academic Year': 'Year',
    'Major': 'Major',
    'Department Chair Position': 'Department',
    'Leadership Quote': 'Quote',
    'Areas of Expertise': 'Expertise',
    'Notable Achievements': 'Achievements',
    'Qualifications': 'Qualifications'
  };
  
  return mappings[header] || header;
}

/**
 * Set up the form submission trigger
 */
function createFormSubmitTrigger() {
  // Remove existing triggers
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'onFormSubmit')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger
  const form = FormApp.openById(CONFIG.FORM_ID);
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
    
  Logger.log('Form submit trigger created successfully');
}

/**
 * Test function to verify getAllProfiles is working
 */
function testGetAllProfiles() {
  try {
    const profiles = getAllProfiles();
    Logger.log(`Found ${profiles.length} profiles`);
    
    if (profiles.length > 0) {
      Logger.log('Sample profile:');
      Logger.log(JSON.stringify(profiles[0], null, 2));
    }
    
    return 'Success! Found ' + profiles.length + ' profiles.';
  } catch (error) {
    Logger.log('Error in testGetAllProfiles: ' + error.toString());
    return 'Error: ' + error.toString();
  }
} 