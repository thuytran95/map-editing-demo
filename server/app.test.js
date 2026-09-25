// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { FeatureStore } from './store.js';

const point = (name, category = 'poi', lon = 105.78) => ({
  type: 'Feature',
  id: `id_${name}`,
  geometry: { type: 'Point', coordinates: [lon, 21.02] },
  properties: { name, category, status: 'active', description: '', attributes: [], updatedAt: '2026-09-01T00:00:00Z' },
});

let app;
beforeEach(() => {
  const initial = [point('Hồ Điều Hòa', 'water'), point('Trạm xe buýt'), point('Bãi đỗ xe'), point('Nhà chờ')];
  app = createApp(new FeatureStore({ initial }));
});

describe('GET /api/features', () => {
  it('phân trang đúng', async () => {
    const res = await request(app).get('/api/features?page=2&limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 3, total: 4, totalPages: 2 });
  });

  it('tìm kiếm không phân biệt dấu', async () => {
    const res = await request(app).get('/api/features').query({ q: 'ho dieu hoa' });
    expect(res.body.data.map((f) => f.properties.name)).toEqual(['Hồ Điều Hòa']);
  });

  it('lọc theo loại đối tượng', async () => {
    const res = await request(app).get('/api/features?category=poi&limit=0');
    expect(res.body.data).toHaveLength(3);
  });
});

describe('POST / PUT / DELETE', () => {
  it('trả 400 khi dữ liệu không hợp lệ', async () => {
    const res = await request(app).post('/api/features').send({ type: 'Feature', properties: { name: '' } });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('name');
    expect(res.body.errors).toHaveProperty('geometry');
  });

  it('tạo mới, cập nhật rồi xóa một đối tượng', async () => {
    const created = await request(app).post('/api/features').send(point('Điểm mới'));
    expect(created.status).toBe(201);
    const id = created.body.id;

    const body = { ...created.body, properties: { ...created.body.properties, name: 'Điểm đã sửa' } };
    const updated = await request(app).put(`/api/features/${id}`).send(body);
    expect(updated.status).toBe(200);
    expect(updated.body.properties.name).toBe('Điểm đã sửa');

    expect((await request(app).delete(`/api/features/${id}`)).status).toBe(204);
    expect((await request(app).get(`/api/features/${id}`)).status).toBe(404);
  });
});
