const XLSX = require('xlsx');

const filePath = 'C:\\Encore Framework\\.tmp\\delegation-out\\dsm-cmx-export-0819\\DiscountMatrix-US-USD-Standard.xlsx';
const workbook = XLSX.readFile(filePath);
const ws = workbook.Sheets['DiscountMatrix'];

console.log('=== Q1: WORKBOOK SHAPE ===');
console.log('Sheet names (in order):');
workbook.SheetNames.forEach((name, idx) => console.log((idx + 1) + '. ' + name));
console.log('First sheet dimensions: ' + ws['!ref']);

// Convert to array of arrays to reliably get all values
const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('\n=== ACTUAL ROW CONTENT ===');
aoa.forEach((row, idx) => {
  console.log('Row ' + (idx + 1) + ': ' + JSON.stringify(row.slice(0, 10)));
});

console.log('\n=== Q2: HEADER ROW (first non-instruction row with "ID") ===');
let headerRowIdx = -1;
for (let i = 0; i < aoa.length; i++) {
  if (aoa[i][0] === 'ID') {
    headerRowIdx = i;
    break;
  }
}
console.log('Header row index: ' + headerRowIdx + ' (row ' + (headerRowIdx + 1) + ')');
console.log('Full header row:');
const headerRow = aoa[headerRowIdx];
for (let i = 0; i < headerRow.length; i++) {
  if (headerRow[i] !== '' && headerRow[i] !== undefined) {
    const col = XLSX.utils.encode_col(i);
    console.log(col + (headerRowIdx + 1) + ': "' + headerRow[i] + '"');
  }
}

console.log('\n=== Q3: ID COLUMN ===');
console.log('Header: A' + (headerRowIdx + 1) + ': "ID"');
console.log('First three data values:');
for (let i = 0; i < 3; i++) {
  const rowIdx = headerRowIdx + 1 + i;
  const val = aoa[rowIdx][0];
  console.log('A' + (rowIdx + 1) + ': "' + val + '"');
}

const v1 = String(aoa[headerRowIdx + 1][0]);
const v2 = String(aoa[headerRowIdx + 2][0]);
const v3 = String(aoa[headerRowIdx + 3][0]);
console.log('\nClassification:');
if (v1.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
  console.log('GUID (36-char hyphenated hex)');
} else if (v1.match(/^\d+$/) && v2.match(/^\d+$/) && v3.match(/^\d+$/)) {
  console.log('NUMERIC-SEQUENTIAL');
} else {
  console.log('OTHER: ' + v1.substring(0, 50));
}

console.log('\n=== Q4: DATA ROWS ===');
const dataRowCount = aoa.length - headerRowIdx - 1;
console.log('Data rows count (excluding header): ' + dataRowCount);

console.log('\nFirst data row:');
const firstDataRowIdx = headerRowIdx + 1;
for (let i = 0; i < 25; i++) {
  const val = aoa[firstDataRowIdx][i];
  if (val !== '' && val !== undefined) {
    const col = XLSX.utils.encode_col(i);
    console.log(col + (firstDataRowIdx + 1) + ': "' + val + '"');
  }
}

console.log('\nLast data row:');
const lastDataRowIdx = aoa.length - 1;
for (let i = 0; i < 25; i++) {
  const val = aoa[lastDataRowIdx][i];
  if (val !== '' && val !== undefined) {
    const col = XLSX.utils.encode_col(i);
    console.log(col + (lastDataRowIdx + 1) + ': "' + val + '"');
  }
}

console.log('\nPercentage cell example (first number cell):');
for (let col = 4; col < 25; col++) {
  for (let row = firstDataRowIdx; row <= lastDataRowIdx; row++) {
    const val = aoa[row][col];
    if (val !== '' && val !== undefined && !isNaN(val)) {
      const colLetter = XLSX.utils.encode_col(col);
      console.log('Example: ' + colLetter + (row + 1) + ': "' + val + '"');
      console.log('(type: ' + typeof val + ')');
      return;
    }
  }
}

console.log('\n=== Q5: OTHER SHEETS ===');
if (workbook.SheetNames.length > 1) {
  for (let i = 1; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const sheet = workbook.Sheets[sheetName];
    const sheetAoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    console.log(sheetName + ': ' + (sheetAoa.length - 1) + ' rows');
  }
} else {
  console.log('No additional sheets.');
}

console.log('\n=== FILE INTEGRITY ===');
console.log('Source file NOT modified, moved, renamed, or deleted.');
