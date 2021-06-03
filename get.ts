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
  return { register: true };
}

function search(params) {
  return { search: true };
}
