function deleteExpiredSession() {
  const dbSheetId =
    PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
  const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("session");
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const indices = sheetData[0];
  const indexOfExpireAt = indices.indexOf("expire_at");

  const now = new Date();
  for (let i = sheetData.length - 1; i > 0; i--) {
    const session = sheetData[i];
    const expireAt = new Date(session[indexOfExpireAt]);
    if (expireAt < now) {
      sheet.deleteRow(i + 1);
    }
  }
}
