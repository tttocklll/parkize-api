function doGet(e) {
  const params = e.parameter;

  const mode = params.mode;

  switch (mode) {
    case "register":
      return ContentService.createTextOutput(JSON.stringify(register(params)));
    case "search":
      return ContentService.createTextOutput(JSON.stringify(search(params)));
    default:
      break;
  }
}

function register(params) {
  try {
    const sheet_id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const last_col = sheet.getLastColumn();
    const last_row = sheet.getLastRow();
    const indices = sheet.getRange(1, 1, 1, last_col).getValues()[0];

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i]
      if (params[index]) {
        sheet.getRange(last_row + 1, i + 1).setValue(params[index]);
      }
    }
    return { register: true };
  } catch (error) {
    Logger.log(error)
  }

}

function search(params) {
  const targetNumber = params.car_number;

  const sheet_id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  // TODO: シートが複数になっても動作するように
  const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
  const last_col = sheet.getLastColumn();
  const last_row = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();

  const indexOfCarNumber = sheetData[0].indexOf("car_number");

  const result = [];
  for (const item of sheetData) {
    if (item[indexOfCarNumber] == targetNumber) {
      result.push(item);
    }
    Logger.log(item[indexOfCarNumber])
  }

  return { search: result, indexOfCarNumber, targetNumber };
}
