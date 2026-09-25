/** Các hàm gọi REST API cho đối tượng bản đồ (tách khỏi component để dễ tái sử dụng và mock khi test). */
import { http } from './httpClient.js';

/** Lấy 1 trang danh sách: params = { q, category, page, limit } */
export async function listFeatures(params) {
  const { data } = await http.get('/features', { params });
  return data; // { data: Feature[], pagination: {...} }
}

/** Lấy toàn bộ đối tượng để hiển thị trên bản đồ (limit = 0). */
export async function fetchAllFeatures() {
  const { data } = await http.get('/features', { params: { limit: 0 } });
  return data.data;
}

export async function createFeature(feature) {
  const { data } = await http.post('/features', feature);
  return data;
}

export async function updateFeature(id, feature) {
  const { data } = await http.put(`/features/${id}`, feature);
  return data;
}

export async function deleteFeature(id) {
  await http.delete(`/features/${id}`);
}
