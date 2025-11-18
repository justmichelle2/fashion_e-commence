const axios = require('axios');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const appConfigPath = path.join(projectRoot, 'app.json');
const rawConfig = fs.readFileSync(appConfigPath, 'utf-8');
const appConfig = JSON.parse(rawConfig);

const baseUrl = process.env.MOBILE_API_URL || appConfig?.expo?.extra?.apiUrl || 'http://localhost:5000/api';

async function main(){
  const client = axios.create({ baseURL: baseUrl, timeout: 10000 });
  const [health, products, designers] = await Promise.all([
    client.get('/health'),
    client.get('/products', { params: { limit: 5 } }),
    client.get('/designers')
  ]);

  const summary = {
    baseUrl,
    health: health.data,
    products: products.data?.products?.length ?? 0,
    designers: designers.data?.designers?.length ?? 0,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error('mobile smoke test failed');
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
