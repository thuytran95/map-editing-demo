/**
 * Điểm khởi động API: node server/index.js  (hoặc npm run server)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { FeatureStore } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const DELAY = Number(process.env.API_DELAY_MS) || 300;

const store = new FeatureStore({
  filePath: path.join(__dirname, 'data', 'features.json'),
  seedPath: path.join(__dirname, 'data', 'seed.json'),
});

createApp(store, { delayMs: DELAY }).listen(PORT, () => {
  console.log(`[api] Map Editing API đang chạy tại http://localhost:${PORT}/api (${store.list().length} đối tượng)`);
});
