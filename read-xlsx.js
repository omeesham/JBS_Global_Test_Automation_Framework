const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'C:\\Encore Framework\\.tmp\\delegation-out\\dsm-cmx-export-0819\\DiscountMatrix-US-USD-Standard.xlsx';

console.log('=== Q1: WORKBOOK SHAPE ===');
const workbook = XLSX.readFile(filePath);
console.log('Sheet names (in order):');
workbook.SheetNames.forEach((name, i) => console.log((i+1) + '. ' + name));

const ws = workbook.Sheets[workbook.SheetNames[0]];
console.log('\nFirst sheet: ' + workbook.SheetNames[0]);
console.log('Dimensions: ' + ws['!ref']);

console.log('\n=== Q2: HEADER ROW ===');
const headerCells = [];
for (let col = 0; col < 26; col++) {
  const cellRef = XLSX.utils.encode_col(col) + '1';
  const cell = ws[cellRef];
  if (cell && cell.v !== undefined) {
    headerCells.push({ ref: cellRef, value: String(cell.v) });
    console.log(cellRef + ': "' + cell.v + '"');
  }
}

console.log('\n=== Q3: ID COLUMN CHECK ===');
let idCol = null;
for (const hc of headerCells) {
  const val = String(hc.value).toLowerCase();
  if (val.includes('id') || val.includes('identifier')) {
    idCol = hc;
    console.log('ID column found: ' + hc.ref.replace('1', '') + ' = "' + hc.value + '"');
    break;
  }
}

if (idCol) {
  console.log('First three ID values:');
  const colLetter = idCol.ref.replace('1', '');
  for (let row = 2; row <= 4; row++) {
    const cell = ws[colLetter + row];
    const val = cell ? cell.v : 'EMPTY';
    console.log(colLetter + row + ': "' + val + '"');
  }
} else {
  console.log('ID-COLUMN: ABSENT');
  console.log('Header row proof:');
  headerCells.forEach(hc => console.log(hc.ref + ': "' + hc.value + '"'));
}

console.log('\n=== Q4: DATA ROWS ===');
const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 });
const dataRowCount = aoa.length - 1;
console.log('Data rows (excluding header): ' + dataRowCount);

if (aoa.length >= 2) {
  console.log('\nFirst data row (row 2):');
  const firstRow = aoa[1];
  for (let i = 0; i < firstRow.length; i++) {
    const col = XLSX.utils.encode_col(i);
    const val = firstRow[i];
    console.log(col + '2: "' + val + '"');
  }
}

if (aoa.length >= 2) {
  console.log('\nLast data row (row ' + aoa.length + '):');
  const lastRow = aoa[aoa.length - 1];
  for (let i = 0; i < lastRow.length; i++) {
    const col = XLSX.utils.encode_col(i);
    const val = lastRow[i];
    console.log(col + aoa.length + ': "' + val + '"');
  }
}

console.log('\nPercentage cell check:');
for (let col = 0; col < 26; col++) {
  for (let row = 2; row <= aoa.length; row++) {
    const cell = ws[XLSX.utils.encode_col(col) + row];
    if (cell && typeof cell.v === 'number' && cell.v >= 0 && cell.v <= 1) {
      const colLetter = XLSX.utils.encode_col(col);
      console.log('Found percentage-like cell: ' + colLetter + row + ' = "' + cell.v + '" (type: ' + typeof cell.v + ')');
      if (cell.z) console.log('  Format: ' + cell.z);
      break;
    }
  }
}

console.log('\n=== Q5: OTHER SHEETS ===');
if (workbook.SheetNames.length > 1) {
  console.log('Additional sheets:');
  for (let i = 1; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(sheetName + ': ' + (data.length - 1) + ' data rows');
  }
} else {
  console.log('No additional sheets.');
}
