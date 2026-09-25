/**
 * Lớp lưu trữ đơn giản: giữ danh sách đối tượng (GeoJSON Feature) trong bộ nhớ
 * và ghi ra file JSON sau mỗi thay đổi. Đủ dùng cho demo; khi triển khai thật
 * có thể thay bằng MongoDB/PostGIS mà không phải sửa app.js (chỉ cần giữ cùng interface).
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export class FeatureStore {
  /**
   * @param {{ filePath?: string|null, seedPath?: string|null, initial?: object[] }} options
   *   filePath = null  -> chỉ lưu trong bộ nhớ (dùng cho kiểm thử)
   */
  constructor({ filePath = null, seedPath = null, initial = [] } = {}) {
    this.filePath = filePath;
    this.features = structuredClone(initial);

    if (filePath) {
      if (!fs.existsSync(filePath) && seedPath && fs.existsSync(seedPath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.copyFileSync(seedPath, filePath);
      }
      if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.features = json.features ?? [];
      }
    }
  }

  persist() {
    if (!this.filePath) return;
    const data = { type: 'FeatureCollection', features: this.features };
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  list() {
    return this.features;
  }

  get(id) {
    return this.features.find((f) => f.id === id) ?? null;
  }

  create(input) {
    const now = new Date().toISOString();
    const feature = {
      type: 'Feature',
      id: `f_${randomUUID().slice(0, 8)}`,
      geometry: input.geometry,
      properties: { ...toProperties(input), createdAt: now, updatedAt: now },
    };
    this.features.unshift(feature);
    this.persist();
    return feature;
  }

  update(id, input) {
    const index = this.features.findIndex((f) => f.id === id);
    if (index === -1) return null;
    const old = this.features[index];
    const updated = {
      ...old,
      geometry: input.geometry,
      properties: {
        ...toProperties(input),
        createdAt: old.properties?.createdAt,
        updatedAt: new Date().toISOString(),
      },
    };
    this.features[index] = updated;
    this.persist();
    return updated;
  }

  remove(id) {
    const before = this.features.length;
    this.features = this.features.filter((f) => f.id !== id);
    const removed = this.features.length !== before;
    if (removed) this.persist();
    return removed;
  }
}

function toProperties(input) {
  return {
    name: input.name.trim(),
    category: input.category,
    status: input.status ?? 'draft',
    description: (input.description ?? '').trim(),
    attributes: (input.attributes ?? []).map((a) => ({
      key: String(a.key).trim(),
      value: a.value === undefined || a.value === null ? '' : String(a.value),
    })),
  };
}
