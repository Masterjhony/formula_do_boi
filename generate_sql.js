const fs = require('fs');

try {
    const rawData = fs.readFileSync('excel_data.json', 'utf8');
    const data = JSON.parse(rawData);

    // We update the 'raca' column AND details->>'raca'.
    let sqlContent = `-- Update products raca generated from Excel file\n\n`;

    let count = 0;
    data.forEach(d => {
        if (d.RGD && d["Raça"]) {
            // Remove single quotes if any to prevent SQL injection issues
            const raca = d["Raça"].replace(/'/g, "''").trim();
            const rgd = String(d.RGD).replace(/'/g, "''").trim();

            // Format for details JSONB: '{"raca": "Nelore Pintado"}' 
            // Better to use jsonb_set properly: jsonb_set(COALESCE(details, '{}'::jsonb), '{raca}', '"Nelore Pintado"')
            sqlContent += `UPDATE public.products SET raca = '${raca}', details = jsonb_set(COALESCE(details, '{}'::jsonb), '{raca}', '"${raca}"') WHERE registro = '${rgd}';\n`;
            count++;
        }
    });

    fs.writeFileSync('database/update_nelore_raca.sql', sqlContent, 'utf8');
    console.log(`Successfully generated SQL for ${count} records.`);
} catch (e) {
    console.error("Error generating SQL:", e);
}
