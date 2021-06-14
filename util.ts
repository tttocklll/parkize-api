export function formatData(data: any[], index: string[]) {
  const res = {};
  for (let i = 0; i < index.length; i++) {
    res[index[i]] = data[i];
  }
  return res;
}

export function createRandomString(length: number) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const cl = characters.length;
  let res = "";
  for (let i = 0; i < length; i++) {
    res += characters[Math.floor(Math.random() * cl)];
  }
  return res;
}

export function createSession(eventName: string) {
  try {
    const dbSheetId =
      PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
    const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("session");
    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const indices = sheetData[0];

    const indexOfSessionId = indices.indexOf("session_id");

    let newSessionId: string;
    while (true) {
      newSessionId = createRandomString(128);
      let isUnique = true;
      for (const session of sheetData) {
        if (session[indexOfSessionId] === newSessionId) {
          isUnique = false;
        }
      }
      if (isUnique) {
        break;
      }
    }

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (index === "session_id") {
        sheet.getRange(lastRow + 1, i + 1).setValue(newSessionId);
      } else if (index === "event_name") {
        sheet.getRange(lastRow + 1, i + 1).setValue(eventName);
      } else if (index === "expire_at") {
        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 12);
        const time = Utilities.formatDate(
          expireAt,
          "Asia/Tokyo",
          "yyyy/MM/dd HH:mm:ss"
        );
        sheet.getRange(lastRow + 1, i + 1).setValue(time);
      }
    }

    return newSessionId;
  } catch (error) {
    throw new Error(
      "セッションを確立できませんでした。もう一度やり直してください。"
    );
  }
}

export function deleteEventFromEventList(eventName: string) {
  const dbSheetId =
    PropertiesService.getScriptProperties().getProperty("DATABASE_SHEET_ID");
  const sheet = SpreadsheetApp.openById(dbSheetId).getSheetByName("event");
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const indices = sheetData[0];

  const indexOfEventName = indices.indexOf("event_name");

  for (let i = 0; i < sheetData.length; i++) {
    if (sheetData[i][indexOfEventName] === eventName) {
      sheet.deleteRow(i + 1);
      return {
        success: true,
      };
    }
  }
}

export function deleteEventFromUserData(eventName: string) {
  const sheet_id =
    PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheet_id).getSheets()[0];
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const sheetData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const indexOfEventName = sheetData[0].indexOf("event_name");

  let deleteCount = 0;
  for (let i = 0; i < sheetData.length; i++) {
    if (sheetData[i][indexOfEventName] === eventName) {
      sheet.deleteRow(i + 1);
      deleteCount++;
    }
  }
  return deleteCount;
}
