const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfPath = path.join(__dirname, '../public/GSOL1442.pdf');

async function debug() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    console.log('--- TEXT CONTENT ---');
    console.log(data.text);
    console.log('--- END TEXT CONTENT ---');
}

debug();
