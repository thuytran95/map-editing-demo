/**
 * Kiểm tra dữ liệu một đối tượng bản đồ.
 * Dùng chung: client kiểm tra trước khi gửi (phản hồi nhanh cho người dùng),
 * server kiểm tra lại trước khi lưu (không tin dữ liệu gửi lên).
 *
 * input = { name, category, status, description, attributes: [{key, value}], geometry }
 * Trả về object lỗi, ví dụ { name: '...', geometry: '...' }. Object rỗng = hợp lệ.
 */
import { CATEGORY_VALUES, STATUS_VALUES, GEOMETRY_TYPES, NAME_MAX_LENGTH } from './constants.js';

const isNumber = (n) => typeof n === 'number' && Number.isFinite(n);

/** Một vị trí [kinh độ, vĩ độ] hợp lệ trong hệ tọa độ WGS84 (EPSG:4326). */
export function isValidPosition(pos) {
  return (
    Array.isArray(pos) &&
    pos.length >= 2 &&
    isNumber(pos[0]) &&
    isNumber(pos[1]) &&
    pos[0] >= -180 &&
    pos[0] <= 180 &&
    pos[1] >= -90 &&
    pos[1] <= 90
  );
}

/** Trả về chuỗi lỗi nếu geometry không hợp lệ, ngược lại trả về null. */
export function validateGeometry(geometry) {
  if (!geometry || typeof geometry !== 'object') {
    return 'Chưa có hình học - hãy vẽ đối tượng trên bản đồ';
  }
  const { type, coordinates } = geometry;
  if (!GEOMETRY_TYPES.includes(type)) {
    return `Kiểu hình học không được hỗ trợ: ${type}`;
  }
  if (type === 'Point') {
    return isValidPosition(coordinates) ? null : 'Tọa độ điểm không hợp lệ';
  }
  if (type === 'LineString') {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return 'Đường phải có ít nhất 2 điểm';
    return coordinates.every(isValidPosition) ? null : 'Tọa độ đường không hợp lệ';
  }
  // Polygon: mảng các vòng (ring); vòng ngoài phải khép kín và có >= 4 vị trí
  if (!Array.isArray(coordinates) || coordinates.length === 0) return 'Vùng không có tọa độ';
  for (const ring of coordinates) {
    if (!Array.isArray(ring) || ring.length < 4) return 'Mỗi vòng của vùng phải có ít nhất 4 điểm';
    if (!ring.every(isValidPosition)) return 'Tọa độ vùng không hợp lệ';
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) return 'Vòng của vùng phải khép kín';
  }
  return null;
}

export function validateFeatureInput(input = {}) {
  const errors = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';

  if (!name) errors.name = 'Vui lòng nhập tên đối tượng';
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Tên tối đa ${NAME_MAX_LENGTH} ký tự`;

  if (!CATEGORY_VALUES.includes(input.category)) errors.category = 'Vui lòng chọn loại đối tượng';

  if (input.status !== undefined && !STATUS_VALUES.includes(input.status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  if (input.attributes !== undefined) {
    if (!Array.isArray(input.attributes)) {
      errors.attributes = 'Danh sách thuộc tính không hợp lệ';
    } else {
      const seen = new Set();
      for (const attr of input.attributes) {
        const key = typeof attr?.key === 'string' ? attr.key.trim() : '';
        if (!key) {
          errors.attributes = 'Tên thuộc tính không được để trống';
          break;
        }
        if (seen.has(key.toLowerCase())) {
          errors.attributes = `Tên thuộc tính bị trùng: ${key}`;
          break;
        }
        seen.add(key.toLowerCase());
      }
    }
  }

  const geometryError = validateGeometry(input.geometry);
  if (geometryError) errors.geometry = geometryError;

  return errors;
}
