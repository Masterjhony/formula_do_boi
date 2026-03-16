async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/webhooks/google-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-secret': '78e82b1aaeff0ac98b6436ead95f91930c7d5321a8c26c83219'
            },
            body: JSON.stringify({
                leads: [{
                    nome_completo: 'Test Webhook Simulator',
                    celular: '5531988787208',
                    data: '16/03/2026',
                    hora: '12:00',
                    cidade: 'BH',
                    estado: 'MG',
                    momento_pecuaria: 'Ainda não tenho nada'
                }]
            })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (e) {
        console.error(e);
    }
}
test();
