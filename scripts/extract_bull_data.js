const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
console.log('PDF Import Type:', typeof pdf);
// List of video URLs provided by the user
const videoUrls = [
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797000/NAJ0078_idonsj.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797002/NAJ104_zs6h1d.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797001/NAJ0093_w9t6kv.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0081_ru72kq.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0086_ikczgj.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796998/NAJ0079_vganrc.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796995/NAJ0071_er1ghq.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796993/NAJ0070_soabad.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796992/NAJ0062_ctat4b.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1610_iohsvl.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1599_h5lmwp.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796984/GSOL1604_xcux6x.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1593_icswoj.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1595_fdrurs.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1592_n9wk0l.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1571_gvdzig.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1563_glu6dk.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1485_wly0pa.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1566_utzvxc.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1449_jqyq1s.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796977/GSOL1499_txpcf5.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1506_rixc90.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796976/GSOL1443_fwwjhg.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796975/GSOL1442_esri7e.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SINO4365_fulo4l.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_14785_zoaigv.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_13550_zufjsb.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226312/SOAL_13851_ermzzx.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/MMAR_3853_t1g79m.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/NBEM_385_m6wjdy.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226307/FVCP_3834_iyjite.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/GSOL382_xih0sz.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8298_wcmdyb.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8096_op3abx.mp4",
    "https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC5148_hmnlpj.mp4"
];

const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(__dirname, '../src/data/bulls_data.json');

// Helper to extract RGD from URL
// Example: https://.../NAJ0078_idonsj.mp4 -> NAJ0078
function getRegFromUrl(url) {
    const filename = url.split('/').pop();
    const parts = filename.split('_');
    return parts[0];
}

// Regex patterns to find data in text
// Adjust these based on the actual PDF content layout
const PATTERNS = {
    nome: /Nome\s*:\s*([^\n\r]+)/i, // or usually just the first line? We'll see.
    rgd: /RGD\s*:\s*([^\n\r]+)/i,
    nascimento: /Nascimento\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
    pai: /Pai\s*:\s*([^\n\r]+)/i,
    mae: /Mãe\s*:\s*([^\n\r]+)/i,
    // Sometimes files just have the value next to the label.
};

async function extractData() {
    console.log('Public Dir:', PUBLIC_DIR);
    const results = [];
    const publicFiles = fs.readdirSync(PUBLIC_DIR);
    console.log('Files found in public:', publicFiles.length);

    for (const url of videoUrls) {
        const rgdKey = getRegFromUrl(url);
        console.log(`Checking URL: ${url} -> Key: ${rgdKey}`);

        // Find matching PDF file (case insensitive search)
        const pdfFile = publicFiles.find(f =>
            f.toLowerCase().includes(rgdKey.toLowerCase()) && f.endsWith('.pdf')
        );

        if (!pdfFile) {
            console.warn(`[WARN] No PDF found for RGD: ${rgdKey} (URL: ${url})`);
            continue;
        }

        const pdfPath = path.join(PUBLIC_DIR, pdfFile);
        console.log(`Processing: ${pdfPath}`);

        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            // ... rest of logic

            const text = data.text;

            const extracted = {
                rgd: rgdKey, // Fallback
                video: url,
                pdf: `/${pdfFile}`,
                name: '',
                pai: '',
                mae: '',
                nascimento: '',
                iabcz: '',
                mgte: ''
            };

            // Generic label search in full text
            const findValue = (regex) => {
                const match = text.match(regex);
                return match ? match[1].trim() : '';
            };

            // Cleanup text slightly (remove extra spaces)
            const cleanText = text.replace(/\s+/g, ' ');

            // Strategy for concatenated header
            // "Nome:PERFEICAORegistro:GSOL 1442Raça:NELORE"
            const nameRegMatch = cleanText.match(/Nome:(.*?)Registro:(.*?)Raça/i);

            if (nameRegMatch) {
                extracted.name = nameRegMatch[1].trim();
                // Prefer extracted RGD over filename if available and cleaner? 
                // Actually filename is RGDKey, let's keep extracted.rgd as fallback or primary if found.
                // But often RGD in PDF has spaces "GSOL 1442".
                // extracted.rgd = nameRegMatch[2].trim(); 
            } else {
                // Fallback: try individual
                extracted.name = findValue(/Nome\s*:\s*([^\n\r:]+)/i);
            }

            extracted.nascimento = findValue(/Nasc\.?:?\s*(\d{2}\/\d{2}\/\d{4})/i) || findValue(/(\d{2}\/\d{2}\/\d{4})/);

            // Pai and Mae often appear as "Pai: NAME Mãe: NAME" or similar lines.
            // Try to find "Pai:" and look ahead until "Mãe" or newline
            const paiMatch = cleanText.match(/Pai:(.*?)Mãe/i) || cleanText.match(/Pai\s*:\s*([^\r\n]+)/i);
            if (paiMatch) {
                extracted.pai = paiMatch[1].replace(/Registro:.*/, '').trim();
            }

            const maeMatch = cleanText.match(/Mãe:(.*?)Avô/i) || cleanText.match(/Mãe\s*:\s*([^\r\n]+)/i);
            // "Mãe: ... Avô" is common in some layouts
            if (maeMatch) {
                extracted.mae = maeMatch[1].replace(/Registro:.*/, '').trim();
            }

            // Clean up name if it still has "Registro" inside (safety)
            if (extracted.name.includes("Registro:")) {
                extracted.name = extracted.name.split("Registro:")[0].trim();
            }

            // Fill empty name with RGD if still failed
            if (!extracted.name) extracted.name = `${rgdKey}`;

            // Try to extract iABCZ or MGTe if possible
            // "iABCZ : 12.34"
            extracted.iabcz = findValue(/iABCZ\s*[:=]\s*([\d\.,]+)/i);
            extracted.mgte = findValue(/MGTe\s*[:=]\s*([\d\.,]+)/i);

            results.push(extracted);

        } catch (err) {
            console.error(`[ERROR] Failed to parse ${pdfFile}:`, err.message);
            // console.error(err.stack);
        }
    }

    // Sort by name or RGD
    results.sort((a, b) => a.rgd.localeCompare(b.rgd));

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`Successfully extracted metadata for ${results.length} bulls.`);
}

extractData();
