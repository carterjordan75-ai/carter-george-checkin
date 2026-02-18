// Google Apps Script for Carter & George Check-In System
// Deploy as a Web App to handle POST requests from the check-in kiosk

const SHEET_ID = '1HRs2I-QbKXxZZ-dXvFp6RZY8gkHPoYRecsce3UuiuKw'; // Carter & George - Patient Check-Ins
const CLINICS = [
  'Amersham',
  'Bedford',
  'Congleton',
  'Glasgow West End',
  'Hale & Altrincham',
  'Hampstead & Golders Green',
  'Harpenden',
  'Hertford',
  'Hitchin',
  'Hurstpierpoint',
  'Northwich',
  'Radlett',
  'St Albans',
  'Staveley',
  'St Ives Huntingdon',
  'Windsor',
  'Wokingham'
];

/**
 * Handle POST requests from the check-in app
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.clinic || !data.firstName || !data.lastName || !data.dob) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Missing required fields' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Write check-in to appropriate clinic tab
    const success = writeCheckInToClinuc(data);

    if (success) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'success', message: 'Check-in recorded' })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Failed to write check-in' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Write check-in data to the appropriate clinic sheet
 */
function writeCheckInToClinuc(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const clinicName = data.clinic;

    // Get or create the clinic sheet
    let sheet = ss.getSheetByName(clinicName);
    if (!sheet) {
      sheet = ss.insertSheet(clinicName);
      initializeSheet(sheet);
    }

    // Parse DOB (comes as DDMMYYYY)
    const dob = data.dob;
    const dobFormatted = dob.slice(0, 2) + '/' + dob.slice(2, 4) + '/' + dob.slice(4, 8);

    // Count number of visits for this patient
    const allData = sheet.getDataRange().getValues();
    let visitCount = 1;
    for (let row = 1; row < allData.length; row++) {
      if (allData[row][2] === data.firstName && allData[row][3] === data.lastName && allData[row][4] === dobFormatted) {
        visitCount++;
      }
    }

    // Prepare row data
    const checkInDate = data.checkInDate || new Date().toLocaleDateString('en-GB');
    const checkInTime = data.checkInTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const row = [
      checkInDate,
      checkInTime,
      data.firstName,
      data.lastName,
      dobFormatted,
      visitCount
    ];

    // Append to sheet
    sheet.appendRow(row);

    Logger.log('Check-in recorded: ' + clinicName + ' - ' + data.firstName + ' ' + data.lastName);
    return true;
  } catch (error) {
    Logger.log('Error in writeCheckInToClinuc: ' + error);
    return false;
  }
}

/**
 * Initialize a clinic sheet with headers
 */
function initializeSheet(sheet) {
  const headers = ['Date', 'Time', 'First Name', 'Last Name', 'Date of Birth', 'Number of Visits'];
  sheet.appendRow(headers);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#00a7e1');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
}

/**
 * Setup all clinic sheets with headers
 * Run this once to initialize the spreadsheet
 */
function setupSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Remove existing sheets except the first one
    const sheets = ss.getSheets();
    if (sheets.length > 0) {
      for (let i = sheets.length - 1; i > 0; i--) {
        ss.deleteSheet(sheets[i]);
      }
      // Rename first sheet if it's not a clinic name
      const firstSheet = sheets[0];
      if (!CLINICS.includes(firstSheet.getName())) {
        firstSheet.setName('Amersham');
      }
    }

    // Create all clinic sheets
    for (let i = 0; i < CLINICS.length; i++) {
      let sheet = ss.getSheetByName(CLINICS[i]);
      if (!sheet) {
        sheet = ss.insertSheet(CLINICS[i]);
      }
      initializeSheet(sheet);
    }

    Logger.log('Spreadsheet setup complete with ' + CLINICS.length + ' clinic tabs');
    SpreadsheetApp.getUi().alert('Spreadsheet initialized with ' + CLINICS.length + ' clinic tabs!');
  } catch (error) {
    Logger.log('Error in setupSheet: ' + error);
    SpreadsheetApp.getUi().alert('Error: ' + error);
  }
}


/**
 * Search for patients across all clinic sheets
 */
function searchPatient(searchName) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const searchResults = [];
    const sheets = ss.getSheets();

    const searchLower = searchName.toLowerCase();

    for (let s = 0; s < sheets.length; s++) {
      const sheet = sheets[s];
      const data = sheet.getDataRange().getValues();

      for (let row = 1; row < data.length; row++) {
        const firstName = data[row][2] ? data[row][2].toString().toLowerCase() : '';
        const lastName = data[row][3] ? data[row][3].toString().toLowerCase() : '';

        if (firstName.includes(searchLower) || lastName.includes(searchLower)) {
          searchResults.push({
            clinic: sheet.getName(),
            date: data[row][0],
            time: data[row][1],
            firstName: data[row][2],
            lastName: data[row][3],
            dob: data[row][4],
            visits: data[row][5]
          });
        }
      }
    }

    return searchResults;
  } catch (error) {
    Logger.log('Error in searchPatient: ' + error);
    return [];
  }
}

/**
 * Display search results in a "Search Results" sheet
 */
function displaySearchResults(results) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let resultsSheet = ss.getSheetByName('Search Results');

    if (!resultsSheet) {
      resultsSheet = ss.insertSheet('Search Results');
    } else {
      resultsSheet.clear();
    }

    const headers = ['Clinic', 'Date', 'Time', 'First Name', 'Last Name', 'Date of Birth', 'Number of Visits'];
    resultsSheet.appendRow(headers);

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      resultsSheet.appendRow([r.clinic, r.date, r.time, r.firstName, r.lastName, r.dob, r.visits]);
    }

    const headerRange = resultsSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#00a7e1');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    Logger.log('Search results displayed: ' + results.length + ' matches found');
  } catch (error) {
    Logger.log('Error in displaySearchResults: ' + error);
  }
}

/**
 * Get all check-ins from today across all clinics
 */
function getTodaysCheckIns() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const todaysCheckins = [];
    const sheets = ss.getSheets();
    const today = new Date().toLocaleDateString('en-GB');

    for (let s = 0; s < sheets.length; s++) {
      const sheet = sheets[s];
      const data = sheet.getDataRange().getValues();

      for (let row = 1; row < data.length; row++) {
        const dateCell = data[row][0];
        const checkInDate = new Date(dateCell).toLocaleDateString('en-GB');

        if (checkInDate === today) {
          todaysCheckins.push({
            clinic: sheet.getName(),
            date: data[row][0],
            time: data[row][1],
            firstName: data[row][2],
            lastName: data[row][3],
            dob: data[row][4],
            visits: data[row][5]
          });
        }
      }
    }

    return todaysCheckins;
  } catch (error) {
    Logger.log('Error in getTodaysCheckIns: ' + error);
    return [];
  }
}

/**
 * Display today's check-ins in a summary sheet
 */
function displayTodaysCheckIns() {
  try {
    const results = getTodaysCheckIns();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let summarySheet = ss.getSheetByName('Today\'s Summary');

    if (!summarySheet) {
      summarySheet = ss.insertSheet('Today\'s Summary');
    } else {
      summarySheet.clear();
    }

    const headers = ['Clinic', 'Time', 'First Name', 'Last Name', 'Date of Birth'];
    summarySheet.appendRow(headers);

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      summarySheet.appendRow([r.clinic, r.time, r.firstName, r.lastName, r.dob]);
    }

    const headerRange = summarySheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#00a7e1');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    Logger.log('Today\'s check-ins summary created: ' + results.length + ' check-ins');
    SpreadsheetApp.getUi().alert('Summary created: ' + results.length + ' check-ins today');
  } catch (error) {
    Logger.log('Error in displayTodaysCheckIns: ' + error);
    SpreadsheetApp.getUi().alert('Error: ' + error);
  }
}

/**
 * Create custom menu in Google Sheets
 */
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Check-In Tools')
    .addItem('Setup Clinic Sheets', 'setupSheet')
    .addSeparator()
    .addItem('Search Patient', 'showSearchDialog')
    .addItem('View Today\'s Check-Ins', 'displayTodaysCheckIns')
    .addToUi();
}

/**
 * Show search dialog
 */
function showSearchDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter patient name to search:');

  if (response.getSelectedButton() == ui.Button.OK) {
    const searchName = response.getResponseText();
    if (searchName.trim() === '') {
      ui.alert('Please enter a name to search');
      return;
    }

    const results = searchPatient(searchName);
    if (results.length === 0) {
      ui.alert('No patients found matching "' + searchName + '"');
    } else {
      displaySearchResults(results);
      ui.alert('Found ' + results.length + ' match(es). Results displayed in "Search Results" sheet.');
    }
  }
}
