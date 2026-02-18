import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';

// ID da Propriedade do Google Analytics 4
const PROPERTY_ID = '483341191';

// Caminho para o arquivo de credenciais da Service Account
// O arquivo está na raiz do projeto
const keyFilePath = path.join(process.cwd(), 'my-project-26492-n8n-08d646031e6d.json');

const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyFilePath,
});

export { analyticsDataClient, PROPERTY_ID };
