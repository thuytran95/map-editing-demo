/**
 * Khôi phục dữ liệu mẫu: chép server/data/seed.json -> server/data/features.json
 * Chạy: npm run seed  (nên dừng server trước khi chạy)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
fs.copyFileSync(path.join(dir, 'seed.json'), path.join(dir, 'features.json'));
const { features } = JSON.parse(fs.readFileSync(path.join(dir, 'features.json'), 'utf8'));
console.log(`Đã khôi phục ${features.length} đối tượng mẫu vào server/data/features.json`);
