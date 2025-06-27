/**
 * Generates report in a new spreadsheet sheet
 */
function generateReportInSheet() {
  var userEmail = Session.getEffectiveUser().getEmail();
  Logger.log('Report generation STARTED (Sheet format) by user: ' + userEmail);
  
  const reportContent = buildReportLogic();
  if (reportContent) {
    createReportAsNewSheet(reportContent);
  }
}

/**
 * Generates report as Gmail draft
 */
function generateReportAsDraft() {
  var userEmail = Session.getEffectiveUser().getEmail();
  Logger.log('Report generation STARTED (Email format) by user: ' + userEmail);
  
  const reportContent = buildReportLogic();
  if (reportContent) {
    createReportAsGmailDraft(reportContent);
  }
}


/**
 * Main function that processes budget data and generates the report
 */
function buildReportLogic() {
  // Configuration defines sheet structure and report formatting
  const CONFIG = {
    DEVIATION_THRESHOLD: 0.20,    // 20% deviation triggers alert
    SHEET_NAME: 'Monthly Budget',
    DATA_START_ROW: 4,
    DATA_RANGE: 'A4:G',          // Data starts at row 4, columns A through G
    COLUMNS: {
      MAIN_CATEGORY: 1,    // Column B - Main budget category name
      SUB_CATEGORY: 2,     // Column C - Subcategory name
      PLANNED: 3,          // Column D - Planned budget amount
      ACTUAL: 5            // Column F - Actual spent amount
    },
    REPORT: {
      TITLE: 'MONTHLY COMPARATIVE REPORT',
      SEPARATOR: '==================================================================================',
      CATEGORY_SEPARATOR: '----------------------------------------------------------------------------------',
      MIN_MONEY_WIDTH: 12
    }
  };

  // Get the spreadsheet and locate the budget sheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const budgetSheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    // Validate that the required sheet exists
  if (!budgetSheet) {
    Logger.log('Report generation FAILED: "' + CONFIG.SHEET_NAME + '" sheet not found');
    SpreadsheetApp.getUi().alert('Error: "' + CONFIG.SHEET_NAME + '" sheet not found.');
    return null;
  }

  // Read all data from the specified range
  const dataRange = budgetSheet.getRange(CONFIG.DATA_RANGE + budgetSheet.getLastRow()); 
  const sheetValues = dataRange.getValues();
  
  // Initialize processing state with report header
  var state = createInitialReportState(CONFIG);

  // Process each row to build the report
  // Each row can be: main category header, main category total, or subcategory
  for (var rowIndex = 0; rowIndex < sheetValues.length; rowIndex++) {
    var row = sheetValues[rowIndex];
    state = processSpreadsheetRow(row, state, CONFIG);
  }
  
  // Convert the accumulated report lines into a single string
  return state.reportLines.join('\n');
}

/**
 * Creates report in a new spreadsheet sheet
 */
function createReportAsNewSheet(reportContent) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Monthly_Comparative_Report';
  var reportSheet = ss.getSheetByName(sheetName);
  
  if (reportSheet) {
    reportSheet.clear();
  } else {
    reportSheet = ss.insertSheet(sheetName);
  }
    reportSheet.getRange('B2').setValue(reportContent).setFontFamily('Consolas').setFontSize(10);
  reportSheet.autoResizeColumn(1);
  ss.setActiveSheet(reportSheet);
  
  Logger.log('Report generation COMPLETED successfully in sheet format');
  SpreadsheetApp.getUi().alert('Success!', 'Report created in the "' + sheetName + '" sheet.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Creates Gmail draft with report content
 */
function createReportAsGmailDraft(reportContent) {
  const subject = 'Monthly Comparative Report - ' + new Date().toLocaleDateString("en-US");
  const body = 'Hello,\n\nHere is the monthly budget comparison summary:\n\n' + reportContent + '\n\nBest regards,';
  
  const htmlBody = body.replace(/\n/g, '<br>');
  GmailApp.createDraft('', subject, body, { htmlBody: htmlBody });
  
  Logger.log('Report generation COMPLETED successfully in email format');
  SpreadsheetApp.getUi().alert('Success!', 'A draft email with the report has been created in your Gmail.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Formats main category section with deviation alerts
 */
function formatMainCategorySection(category, subCategories, config) {
  var reportLines = [];
  var deviation = calculateDeviation(category.actual, category.planned);
  
  reportLines.push('CATEGORY: ' + category.name);
  reportLines.push(' > Planned: ' + formatMoneyWithAlignment(category.planned));
  reportLines.push(' > Actual:  ' + formatMoneyWithAlignment(category.actual));
  reportLines.push('');
  
  // Here we check categories outside the threshold and the ones with no budget planned and Actual more than zero
  if ((Math.abs(deviation) >= config.DEVIATION_THRESHOLD) || (category.planned == 0 && category.actual > 0)) {
    if(category.planned > 0){
      var overUnder = deviation > 0 ? 'over' : 'under';
      reportLines.push(category.name + ' is ' + overUnder + ' budget by ' + Math.abs(deviation * 100).toFixed(0) + '%.');
    } else {
      reportLines.push(category.name + ' is over the planned Budget of $0.');
    }
    
    var subcategoryLines = formatSubcategoriesSection(subCategories, config);
    for (var i = 0; i < subcategoryLines.length; i++) {
      reportLines.push(subcategoryLines[i]);
    }
  }
  
  reportLines.push(config.REPORT.CATEGORY_SEPARATOR);
  reportLines.push('');
  
  return reportLines;
}

/**
 * Formats subcategories that have significant deviations
 */
function formatSubcategoriesSection(subCategories, config) {
  var reportLines = [];
  
  for (var subIndex = 0; subIndex < subCategories.length; subIndex++) {
    var subCategory = subCategories[subIndex];
    var subDeviation = calculateDeviation(subCategory.actual, subCategory.planned);
    
    if ((Math.abs(subDeviation) >= config.DEVIATION_THRESHOLD) || (subCategory.planned == 0 && subCategory.actual > 0)) {
      reportLines.push(' - ' + subCategory.name + ': ' + formatMoneyWithAlignment(subCategory.actual) + ' (Actual) vs ' + formatMoneyWithAlignment(subCategory.planned) + ' (Planned)');
      reportLines.push('');
    }
  }
  
  return reportLines;
}

/**
 * Processes each spreadsheet row and determines its type (header, total, or subcategory)
 * 
 * Row types explained:
 * - Header row: Has main category name but no planned amount (category title)
 * - Total row: Has main category name AND planned amount (category summary)
 * - Subcategory row: Has subcategory name when a category is active
 */
function processSpreadsheetRow(row, state, config) {
  // Extract data from current row
  var mainCategoryName = row[config.COLUMNS.MAIN_CATEGORY];
  var subCategoryName = row[config.COLUMNS.SUB_CATEGORY];
  var plannedValue = parseFloat(row[config.COLUMNS.PLANNED]) || 0;
  var actualValue = parseFloat(row[config.COLUMNS.ACTUAL]) || 0;

  // Logic to identify row type:
  // Header: Main category name exists, but no planned amount
  // Total: Main category name exists AND planned amount exists  
  var isMainCategoryHeader = (row[config.COLUMNS.MAIN_CATEGORY] !== '') && (row[config.COLUMNS.PLANNED] === '');
  var isMainCategoryTotal = (row[config.COLUMNS.MAIN_CATEGORY] !== '') && (row[config.COLUMNS.PLANNED] !== '');

  // CASE 1: Main category header row (starts a new category section)
  if (isMainCategoryHeader) {
    // Store the category name and mark this category as active for collecting subcategories
    state.currentMainCategory.name = mainCategoryName;
    state.isCategoryActive = true;
  }
  // CASE 2: Main category total row (ends the current category and generates output)
  else if (state.isCategoryActive && isMainCategoryTotal) {
    // Store the planned and actual totals for this category
    state.currentMainCategory.planned = plannedValue;
    state.currentMainCategory.actual = actualValue;
    
    // Generate the formatted output for this complete category
    var categoryLines = formatMainCategorySection(state.currentMainCategory, state.subCategories, config);
    for (var i = 0; i < categoryLines.length; i++) {
      state.reportLines.push(categoryLines[i]);
    }
    
    // Reset for next category - clear all temporary data
    state.isCategoryActive = false;
    state.subCategories = [];
    state.currentMainCategory = { name: '', planned: 0, actual: 0 };
  }
  // CASE 3: Subcategory row (collect data while category is active)
  else if (state.isCategoryActive && (subCategoryName !== '')) {
    // Add this subcategory to the current category's collection
    state.subCategories.push({ name: subCategoryName, planned: plannedValue, actual: actualValue });
  }  
  return state;
}

/**
 * Creates initial state for report processing
 */
function createInitialReportState(config) {
  return {
    reportLines: [
      '                            ' + config.REPORT.TITLE,
      config.REPORT.SEPARATOR,
      ''
    ],
    currentMainCategory: { name: '', planned: 0, actual: 0 },
    subCategories: [],
    isCategoryActive: false
  };
}

/**
 * Formats monetary values with proper alignment
 */
function formatMoneyWithAlignment(value){
  var formattedValue = '$' + Math.abs(value).toFixed(2);
  if (value < 0) {
    formattedValue = '-' + formattedValue;
  }
  return formattedValue;
}

/**
 * Calculates deviation percentage between actual and planned values
 */
function calculateDeviation(actual, planned) {
  return planned > 0 ? (actual - planned) / planned : 0;
}