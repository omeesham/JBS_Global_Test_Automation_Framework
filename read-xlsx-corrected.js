const XLSX = require('xlsx');

const filePath = 'C:\\Encore Framework\\.tmp\\delegation-out\\dsm-cmx-export-0819\\DiscountMatrix-US-USD-Standard.xlsx';
const workbook = XLSX.readFile(filePath);
const ws = workbook.Sheets['DiscountMatrix'];

console.log('=== CORRECTED: Header row is actually ROW 2 ===');
console.log('Row 1 (instruction): ' + ws['A1'].v);

console.log('\n=== Q2: HEADER ROW (Row 2) ===');
for (let col = 0; col < 25; col++) {
  const cellRef = XLSX.utils.encode_col(col) + '2';
  const cell = ws[cellRef];
  if (cell && cell.v !== undefined) {
    console.log(cellRef + ': "' + cell.v + '"');
  }
}

console.log('\n=== Q3: ID COLUMN ===');
const idHeaderCell = ws['A2'];
console.log('Column A, Header (A2): "' + idHeaderCell.v + '"');
console.log('\nFirst three data values (rows 3-5):');
console.log('A3: "' + ws['A3'].v + '"');
console.log('A4: "' + ws['A4'].v + '"');
console.log('A5: "' + ws['A5'].v + '"');

console.log('\nValue shape classification:');
const val1 = String(ws['A3'].v);
const val2 = String(ws['A4'].v);
const val3 = String(ws['A5'].v);
if (val1.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
  console.log('Classification: GUID (36-char hyphenated hex)');
} else if (val1.match(/^\d+$/) && val2.match(/^\d+$/) && val3.match(/^\d+$/)) {
  console.log('Classification: NUMERIC-SEQUENTIAL');
} else {
  console.log('Classification: OTHER');
}

console.log('\n=== Q4: DATA ROWS ===');
const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 });
const dataRowCount = aoa.length - 2;
console.log('Data rows (excluding instruction row 1 and header row 2): ' + dataRowCount);

console.log('\nFirst data row (row 3):');
const firstDataRow = aoa[2];
for (let i = 0; i < firstDataRow.length; i++) {
  const col = XLSX.utils.encode_col(i);
  console.log(col + '3: "' + firstDataRow[i] + '"');
}

console.log('\nLast data row (row 12):');
const lastDataRow = aoa[aoa.length - 1];
for (let i = 0; i < lastDataRow.length; i++) {
  const col = XLSX.utils.encode_col(i);
  console.log(col + '12: "' + lastDataRow[i] + '"');
}

console.log('\n=== Percentage cell format ===');
let foundPercentExample = false;
for (let col = 4; col < 25 && !foundPercentExample; col++) {
  for (let row = 3; row <= 12; row++) {
    const cell = ws[XLSX.utils.encode_col(col) + row];
    if (cell && typeof cell.v === 'number') {
      const colLetter = XLSX.utils.encode_col(col);
      const cellRef = colLetter + row;
      console.log('Example percentage cell: ' + cellRef + ' = "' + cell.v + '"');
      foundPercentExample = true;
      break;
    }
  }
}

console.log('\n=== File integrity ===');
console.log('Source file: C:\\Encore Framework\\.tmp\\delegation-out\\dsm-cmx-export-0819\\DiscountMatrix-US-USD-Standard.xlsx');
console.log('File NOT modified, moved, renamed, or deleted.');
