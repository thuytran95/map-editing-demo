/**
 * Khởi tạo ứng dụng Express (REST API cho dữ liệu bản đồ).
 * Tách riêng khỏi index.js để có thể kiểm thử bằng supertest mà không cần mở cổng mạng.
 *
 * Các API:
 *   GET    /api/health
 *   GET    /api/categories
 *   GET    /api/features?q=&category=&geomType=&page=&limit=   (limit=0 -> lấy tất cả)
 *   GET    /api/features/:id
 *   POST   /api/features          body: GeoJSON Feature
 *   PUT    /api/features/:id      body: GeoJSON Feature
 *   DELETE /api/features/:id
 */
import express from 'express';
import cors from 'cors';
import { CATEGORIES, STATUSES, GEOMETRY_TYPES } from '../shared/constants.js';
import { validateFeatureInput } from '../shared/featureValidation.js';
import { matchesKeyword } from './textSearch.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/** Lấy các trường cần thiết từ body (GeoJSON Feature) thành input phẳng để kiểm tra. */
function toInput(body = {}) {
  const p = body.properties ?? {};
  return {
    name: p.name,
    category: p.category,
    status: p.status,
    description: p.description,
    attributes: p.attributes ?? [],
    geometry: body.geometry,
  };
}

export function createApp(store, { delayMs = 0 } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Giả lập độ trễ mạng để quan sát trạng thái loading ở giao diện
  if (delayMs > 0) {
    app.use('/api', (req, res, next) => setTimeout(next, delayMs));
  }

  app.get('/api/health', (req, res) => res.json({ status: 'ok', total: store.list().length }));

  app.get('/api/categories', (req, res) => res.json({ categories: CATEGORIES, statuses: STATUSES }));

  app.get('/api/features', (req, res) => {
    const { q = '', category = 'all', geomType = 'all' } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : Math.min(Math.max(parsedLimit, 0), MAX_LIMIT);

    let result = store
      .list()
      .filter((f) => category === 'all' || f.properties?.category === category)
      .filter((f) => geomType === 'all' || !GEOMETRY_TYPES.includes(geomType) || f.geometry?.type === geomType)
      .filter((f) => matchesKeyword(f, q));

    // Mới cập nhật lên đầu
    result = [...result].sort((a, b) =>
      String(b.properties?.updatedAt ?? '').localeCompare(String(a.properties?.updatedAt ?? '')),
    );

    const total = result.length;
    if (limit === 0) {
      return res.json({ data: result, pagination: { page: 1, limit: 0, total, totalPages: 1 } });
    }
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const data = result.slice((page - 1) * limit, page * limit);
    return res.json({ data, pagination: { page, limit, total, totalPages } });
  });

  app.get('/api/features/:id', (req, res) => {
    const feature = store.get(req.params.id);
    if (!feature) return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
    return res.json(feature);
  });

  app.post('/api/features', (req, res) => {
    const input = toInput(req.body);
    const errors = validateFeatureInput(input);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
    }
    return res.status(201).json(store.create(input));
  });

  app.put('/api/features/:id', (req, res) => {
    if (!store.get(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
    const input = toInput(req.body);
    const errors = validateFeatureInput(input);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
    }
    return res.json(store.update(req.params.id, input));
  });

  app.delete('/api/features/:id', (req, res) => {
    const removed = store.remove(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Không tìm thấy đối tượng' });
    return res.status(204).end();
  });

  app.use('/api', (req, res) => res.status(404).json({ message: 'API không tồn tại' }));

  // Middleware xử lý lỗi tập trung (4 tham số)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Body không phải JSON hợp lệ' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  });

  return app;
}
