function onOpen() {
  ProsprScript.onOpen();

  SpreadsheetApp.getUi()
      .createMenu('Admin')
      .addItem('Access', 'authenticateAdmin')
      .addItem('Reset Password', 'setupAdminPassword')
      .addToUi();
  Logger.log("Admin Menu Item created")
}

function setView() {
  ProsprScript.setView();
}

function showSidebar() {
  ProsprScript.showSidebar();
}

function newCategory() {
  ProsprScript.newCategory();
}

function include(filename) {
  ProsprScript.include(filename);
}

function getGroup() {
  ProsprScript.getGroup();
}

function getCategories() {
  ProsprScript.getCategories();
}

function dropDown(sourceSheet, column, startRow) {
  ProsprScript.dropDown(sourceSheet, column, startRow);
}

function newCatInfo(form) {
  ProsprScript.newCatInfo(form);
}

function titleCase(string) {
  ProsprScript.titleCase(string);
}

function FindLastRowofSpecificColumn(sheet, col) {
  ProsprScript.FindLastRowofSpecificColumn(sheet, col);
}

function Trigger() {
  ProsprScript.Trigger();
}

function triggerOff() {
  ProsprScript.triggerOff();
}

function getMissingGroups() {
  ProsprScript.getMissingGroups();
}

function tabNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheetNames = [];
  for (var i = 0; i < sheets.length; i++) {
    sheetNames.push(sheets[i].getName());
  }
  console.log(sheetNames.join(','));
}

function removeRangeProtections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  for (var x = 0; x < sheets.length; x++) {
    var protections = sheets[x].getProtections(SpreadsheetApp.ProtectionType.RANGE);
    if (protections.length > 0) {
      ss.toast(sheets[x].getName() + ' prot:' + protections.length, 'status', 5);
      for (var i = 0; i < protections.length; i++) {
        var protection = protections[i];
        if (protection.canEdit()) {
          protection.remove();
        }
      }
    }
  }
  ss.toast('Done', 'status', 3);
}