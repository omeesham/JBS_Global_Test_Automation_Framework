const ExcelJS = require('exceljs');

async function readFile() {
  const filePath = 'C:\\Encore Framework\\.tmp\\delegation-out\\dsm-cmx-export-0819\\DiscountMatrix-US-USD-Standard.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const ws = workbook.worksheets[0];
  console.log('Sheet name: ' + ws.name);
  console.log('Dimensions: ' + ws.dimensions.address);
  
  console.log('\n=== ALL ROWS (to understand structure) ===');
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = [];
    row.eachCell({ includeEmpty: false }, (cell) => {
      values.push(cell.value);
    });
    console.log('Row ' + rowNumber + ': ' + JSON.stringify(values));
  });
}

readFile().catch(e => console.error(e));
