/** 
 * Request the user password previously stored in PropertiesService.
 */
function authenticateAdmin() {
  var ui = SpreadsheetApp.getUi();
  
  // Read the securely stored password
  var storedPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');

  // If no password has been set at all, inform the user and stop.
  if (!storedPassword) {
    ui.alert('Configuration Error', 'The administrator password has not been set. Please contact the spreadsheet owner to run the setup.', ui.ButtonSet.OK);
    return;
  }
  
  var response = ui.prompt('Restricted Access', 'Please enter the administrator code:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() == ui.Button.OK) {
    // Compare the entered password with the secure password
    if (response.getResponseText() == storedPassword) {
      showAdminMenu();
    } else {
      ui.alert('Error', 'Incorrect administrator code.', ui.ButtonSet.OK);
    }
  }
}

/**
 * Allows the user to setup a new password and override the value previously stored in PropertiesService, but 
 * only if they insert the previous password.
 */
function setupAdminPassword() {
  var ui = SpreadsheetApp.getUi();
  var scriptProperties = PropertiesService.getScriptProperties();
  var currentPassword = scriptProperties.getProperty('ADMIN_PASSWORD');

  // If a password already exists, require it before setting a new one.
  if (currentPassword) {
    var checkResponse = ui.prompt('Security Check', 'To set a new password, please enter the current admin password:', ui.ButtonSet.OK_CANCEL);

    // If the user cancelled or the password is wrong, stop.
    if (checkResponse.getSelectedButton() != ui.Button.OK) {
      ui.alert('Action cancelled.');
      return;
    }

    if (checkResponse.getResponseText() != currentPassword) {
      ui.alert('Error', 'Incorrect current password. Password change aborted.', ui.ButtonSet.OK);
      return;
    }
  }

  // Proceed to set a new password (or the initial one if none existed).
  var newPasswordResponse = ui.prompt('Security Configuration', 'Enter the new administrator password:', ui.ButtonSet.OK_CANCEL);

  if (newPasswordResponse.getSelectedButton() == ui.Button.OK && newPasswordResponse.getResponseText() != '') {
    var newPassword = newPasswordResponse.getResponseText();
    
    // Securely store the new password in script properties
    scriptProperties.setProperty('ADMIN_PASSWORD', newPassword);
    
    ui.alert('Success', 'The administrator password has been set securely.', ui.ButtonSet.OK);
  } else {
    ui.alert('Action cancelled.');
  }
}

/**
 * Creates and displays admin menu with real tools after authentication.
 */
function showAdminMenu() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Admin');
  menu.addItem('Generate Monthly Report (In Sheet)', 'generateReportInSheet');
  menu.addItem('Generate Monthly Report (In E-mail)', 'generateReportAsDraft');
  menu.addToUi();
  
  ui.alert('Access Granted', 'The "Admin Tools" menu has been added to the menu bar. It will disappear when the spreadsheet is reloaded.', ui.ButtonSet.OK);
}