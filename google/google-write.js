const { getSheetsClient } = require('./google-auth');

async function writeCell(sheetName, rowIndex, colIndex, value) {
  const sheets = await getSheetsClient();

  // У Google Sheets індексація з 1 (тобто: A1, B1, C1, ...)
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

module.exports = {
  writeCell,
};
