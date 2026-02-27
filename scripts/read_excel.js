const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('Fórmula do Boi (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

if (data.length > 0) {
    fs.writeFileSync('excel_data.json', JSON.stringify(data, null, 2));
    console.log(`Saved all ${data.length} records to excel_data.json`);
}
