import { formatData } from "./util";

function doGet(e) {
  const params = e.parameter;

  const mode = params.mode;

  switch (mode) {
    case "register":
      return ContentService.createTextOutput(JSON.stringify(register(params)));
    case "search":
      return ContentService.createTextOutput(JSON.stringify(search(params)));
    case "list_all":
      return ContentService.createTextOutput(JSON.stringify(listAll()));
    default:
      break;
  }
}

function register(params) {
  try {
    const sheet_id =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const last_col = sheet.getLastColumn();
    const last_row = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();
    const indices = sheetData[0];
    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfName = sheetData[0].indexOf("name");

    for (const data of sheetData) {
      if (
        data[indexOfCarNumber] == params.car_number &&
        data[indexOfName] == params.name
      ) {
        return {
          success: false,
          error: "同じナンバーと名前の人が登録されています",
        };
      }
    }

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (params[index]) {
        sheet.getRange(last_row + 1, i + 1).setValue(params[index]);
      } else if (index === "status") {
        sheet.getRange(last_row + 1, i + 1).setValue("未出庫");
      } else if (index === "created_at") {
        const now = new Date();
        const time = Utilities.formatDate(
          now,
          "Asia/Tokyo",
          "yyyy/MM/dd HH:mm:ss"
        );
        sheet.getRange(last_row + 1, i + 1).setValue(time);
      }
    }
    return { success: true };
  } catch (error) {
    Logger.log(error);
  }
}

function search(params) {
  const targetNumber = params.car_number;

  const sheet_id =
    PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  // TODO: シートが複数になっても動作するように
  const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
  const last_col = sheet.getLastColumn();
  const last_row = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();

  const indexOfCarNumber = sheetData[0].indexOf("car_number");

  const result = [];
  for (const item of sheetData) {
    if (item[indexOfCarNumber] == targetNumber) {
      result.push(formatData(item, sheetData[0]));
    }
  }

  return { success: true, result, targetNumber };
}

function listAll() {
  const sheet_id =
    PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  // TODO: シートが複数になっても動作するように
  const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
  const last_col = sheet.getLastColumn();
  const last_row = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();

  const result = [];
  for (const item of sheetData) {
    if (item[0]) result.push(formatData(item, sheetData[0]));
  }

  return { success: true, result: result.slice(1) };
}
