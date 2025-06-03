const { getSheetsClient } = require('./google-auth');

async function writeCell(sheetName, rowIndex, colIndex, value) {
  const sheets = await getSheetsClient();

  const columnLetter = String.fromCharCode('A'.charCodeAt(0) + colIndex);
  const cell = `${sheetName}!${columnLetter}${rowIndex + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: cell,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[value]],
    },
  });
}

async function writeRow(sheetName, rowData) {
  const sheets = await getSheetsClient();

  const range = `${sheetName}!A1`;

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowData],
    },
  });
}

module.exports = {
  writeCell,
  writeRow,
};

