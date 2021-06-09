import { formatData } from "./util";

function doGet(e) {
  const params = e.parameter;

  const mode = params.mode;
  if (!mode) {
    return JSON.stringify({
      success: false,
      error: `モードを指定してください`,
    });
  }

  switch (mode) {
    case "register":
      return ContentService.createTextOutput(JSON.stringify(register(params)));
    case "search":
      return ContentService.createTextOutput(JSON.stringify(search(params)));
    case "list_all":
      return ContentService.createTextOutput(JSON.stringify(listAll()));
    case "flip_status":
      return ContentService.createTextOutput(
        JSON.stringify(flipStatus(params))
      );
    case "delete":
      return ContentService.createTextOutput(
        JSON.stringify(deleteData(params))
      );
    default:
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: `モード "${mode}" は存在しません`,
        })
      );
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

    if (!params.forceRegister) {
      const sameNumbers = [];
      for (const data of sheetData) {
        if (data[indexOfCarNumber] == params.car_number) {
          sameNumbers.push(formatData(data, indices));
        }
      }
      if (sameNumbers.length > 0) {
        return {
          success: false,
          error: "同じナンバーと名前の人が登録されています",
          sameNumbers,
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
    return {
      success: false,
      error,
    };
  }
}

function search(params) {
  try {
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
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function listAll() {
  try {
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
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function flipStatus(params) {
  try {
    const targetCreatedAt = params.created_at;
    const targetCarNumber = params.car_number;

    const sheet_id =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const last_col = sheet.getLastColumn();
    const last_row = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();

    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfCreatedAt = sheetData[0].indexOf("created_at");
    const indexOfLeftAt = sheetData[0].indexOf("left_at");
    const indexOfStatus = sheetData[0].indexOf("status");

    for (let i = 0; i < sheetData.length; i++) {
      if (
        sheetData[i][indexOfCarNumber] == targetCarNumber &&
        new Date(sheetData[i][indexOfCreatedAt]).getTime() ===
          new Date(targetCreatedAt).getTime()
      ) {
        const targetCell = sheet.getRange(i + 1, indexOfStatus + 1);
        const value = targetCell.getValue();
        if (value === "未出庫") {
          const now = new Date();
          const time = Utilities.formatDate(
            now,
            "Asia/Tokyo",
            "yyyy/MM/dd HH:mm:ss"
          );
          sheet.getRange(i + 1, indexOfLeftAt + 1).setValue(time);
          targetCell.setValue("出庫済");
        } else {
          sheet.getRange(i + 1, indexOfLeftAt + 1).setValue("");
          targetCell.setValue("未出庫");
        }
        return {
          success: true,
        };
      }
    }
    return {
      success: false,
      error: "該当するデータが見つかりませんでした",
    };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function deleteData(params) {
  try {
    const targetCreatedAt = params.created_at;
    const targetCarNumber = params.car_number;

    const sheet_id =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const last_col = sheet.getLastColumn();
    const last_row = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, last_row, last_col).getValues();

    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfCreatedAt = sheetData[0].indexOf("created_at");
    const indexOfStatus = sheetData[0].indexOf("status");

    for (let i = 0; i < sheetData.length; i++) {
      if (
        sheetData[i][indexOfCarNumber] == targetCarNumber &&
        new Date(sheetData[i][indexOfCreatedAt]).getTime() ===
          new Date(targetCreatedAt).getTime()
      ) {
        sheet.deleteRow(i + 1);
        return {
          success: true,
        };
      }
    }
    return {
      success: false,
      error: "該当するデータが見つかりませんでした",
    };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}
