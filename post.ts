function doPost(e) {
  Logger.log(e);
  return ContentService.createTextOutput(JSON.stringify(e));
}
