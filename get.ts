import { formatData, createSession, deleteEventFromEventList, deleteEventFromUserData, } from "./util";

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
      return ContentService.createTextOutput(JSON.stringify(listAll(params)));
    case "flip_status":
      return ContentService.createTextOutput(
        JSON.stringify(flipStatus(params))
      );
    case "delete":
      return ContentService.createTextOutput(
        JSON.stringify(deleteData(params))
      );
    case "get_all_events":
      return ContentService.createTextOutput(
        JSON.stringify(getAllEvents(params))
      );
    case "login":
      return ContentService.createTextOutput(JSON.stringify(login(params)));
    case "get_session":
      return ContentService.createTextOutput(
        JSON.stringify(getSession(params))
      );
    case "create_event":
      return ContentService.createTextOutput(
        JSON.stringify(createEvent(params))
      );
    case "delete_event":
      return ContentService.createTextOutput(
        JSON.stringify(deleteEvent(params))
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
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const indices = sheetData[0];
    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfEventName = sheetData[0].indexOf("event_name");

    if (!params.forceRegister) {
      const sameNumbers = [];
      for (const data of sheetData) {
        if (
          data[indexOfCarNumber] == params.car_number &&
          data[indexOfEventName] === params.event_name
        ) {
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
        sheet.getRange(lastRow + 1, i + 1).setValue(params[index]);
      } else if (index === "status") {
        sheet.getRange(lastRow + 1, i + 1).setValue("未出庫");
      } else if (index === "created_at") {
        const now = new Date();
        const time = Utilities.formatDate(
          now,
          "Asia/Tokyo",
          "yyyy/MM/dd HH:mm:ss"
        );
        sheet.getRange(lastRow + 1, i + 1).setValue(time);
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
    const targetEventName = params.event_name;

    const sheet_id =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfEventName = sheetData[0].indexOf("event_name");

    const result = [];
    for (const item of sheetData) {
      if (
        item[indexOfCarNumber] == targetNumber &&
        item[indexOfEventName] === targetEventName
      ) {
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

function listAll(params) {
  try {
    const targetEventName = params.event_name;

    const sheet_id =
      PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    // TODO: シートが複数になっても動作するように
    const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const indexOfEventName = sheetData[0].indexOf("event_name");

    const result = [];
    for (const item of sheetData) {
      if (item[indexOfEventName] === targetEventName) {
        result.push(formatData(item, sheetData[0]));
      }
    }

    return { success: true, result, targetEventName };
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
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

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
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const indexOfCarNumber = sheetData[0].indexOf("car_number");
    const indexOfCreatedAt = sheetData[0].indexOf("created_at");

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

function getAllEvents(params) {
  try {
    const dbSheetId =
      PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
    const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("event");
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

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

function login(params) {
  const password = params.password;
  const targetEventName = params.event_name;

  try {
    const dbSheetId =
      PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
    const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("event");
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const indexOfEventName = sheetData[0].indexOf("event_name");
    const indexOfPassword = sheetData[0].indexOf("password");

    for (const event of sheetData) {
      if (event[indexOfEventName] === targetEventName) {
        if (event[indexOfPassword] === password) {
          const sessionId = createSession(targetEventName);
          return {
            success: true,
            login: true,
            sessionId,
          };
        }
        return {
          success: false,
          error: "パスワードが間違っています",
        };
      }
    }
    return {
      success: false,
      error: "イベントが存在しません",
    };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function getSession(params) {
  try {
    const sessionId = params.session_id;

    const dbSheetId =
      PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
    const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("session");
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const indices = sheetData[0];

    const indexOfSessionId = indices.indexOf("session_id");
    const indexOfExpireAt = indices.indexOf("expire_at");
    const indexOfEventName = indices.indexOf("event_name");

    const now = new Date();
    for (const session of sheetData) {
      if (session[indexOfSessionId] === sessionId) {
        const expireAt = new Date(session[indexOfExpireAt]);
        if (now < expireAt) {
          return {
            success: true,
            event_name: session[indexOfEventName],
          };
        }
        return {
          success: false,
          error: "タイムアウトしました。再ログインしてください。",
        };
      }
    }
    return {
      success: false,
      error: "ログインしてください",
    };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function createEvent(params) {
  const eventName = params.event_name;
  const password = params.password;

  try {
    const dbSheetId =
      PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
    const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("event");
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const indices = sheetData[0];

    const indexOfPassword = indices.indexOf("password");
    const indexOfEventName = indices.indexOf("event_name");

    for (const event of sheetData) {
      if (event[indexOfEventName] === eventName) {
        return {
          success: false,
          error: "同じ名前のイベントがあります",
        };
      }
    }

    sheet.getRange(lastRow + 1, indexOfEventName + 1).setValue(eventName);
    sheet.getRange(lastRow + 1, indexOfPassword + 1).setValue(password);

    return { success: true };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}

function deleteEvent(params) {
  const eventName = params.event_name;
  try {
    deleteEventFromEventList(eventName);
    const deleteCount = deleteEventFromUserData(eventName);
    return {
      success: true,
      deleteCount,
    };
  } catch (error) {
    Logger.log(error);
    return {
      success: false,
      error,
    };
  }
}
