/**
 * Hằng số dùng chung cho cả server (Node.js) và client (React).
 * Đặt ở một chỗ để hai phía luôn thống nhất danh mục loại đối tượng / trạng thái.
 */

export const CATEGORIES = [
  { value: 'building', label: 'Tòa nhà', color: '#1976d2' },
  { value: 'road', label: 'Đường giao thông', color: '#f57c00' },
  { value: 'park', label: 'Cây xanh - công viên', color: '#388e3c' },
  { value: 'water', label: 'Mặt nước', color: '#0097a7' },
  { value: 'poi', label: 'Điểm quan tâm (POI)', color: '#7b1fa2' },
];

export const STATUSES = [
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang sử dụng' },
  { value: 'archived', label: 'Lưu trữ' },
];

/** Các kiểu hình học được hỗ trợ (theo chuẩn GeoJSON - RFC 7946). */
export const GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon'];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);
export const STATUS_VALUES = STATUSES.map((s) => s.value);

export const NAME_MAX_LENGTH = 100;
