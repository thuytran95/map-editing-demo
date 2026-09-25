// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateFeatureInput, validateGeometry } from './featureValidation.js';

const polygon = {
  type: 'Polygon',
  coordinates: [[[105.78, 21.02], [105.79, 21.02], [105.79, 21.03], [105.78, 21.02]]],
};

describe('validateGeometry', () => {
  it('chấp nhận điểm hợp lệ', () => {
    expect(validateGeometry({ type: 'Point', coordinates: [105.78, 21.02] })).toBeNull();
  });
  it('từ chối vĩ độ vượt quá 90', () => {
    expect(validateGeometry({ type: 'Point', coordinates: [105.78, 95] })).toMatch(/không hợp lệ/);
  });
  it('từ chối đường chỉ có 1 điểm', () => {
    expect(validateGeometry({ type: 'LineString', coordinates: [[105.78, 21.02]] })).toMatch(/ít nhất 2/);
  });
  it('từ chối vùng không khép kín', () => {
    const open = { type: 'Polygon', coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2]]] };
    expect(validateGeometry(open)).toMatch(/khép kín/);
  });
  it('chấp nhận vùng hợp lệ', () => {
    expect(validateGeometry(polygon)).toBeNull();
  });
});

describe('validateFeatureInput', () => {
  it('báo lỗi khi thiếu tên, loại và hình học', () => {
    const errors = validateFeatureInput({ name: '   ' });
    expect(errors).toHaveProperty('name');
    expect(errors).toHaveProperty('category');
    expect(errors).toHaveProperty('geometry');
  });
  it('báo lỗi thuộc tính trùng tên (không phân biệt hoa thường)', () => {
    const errors = validateFeatureInput({
      name: 'Tòa nhà A',
      category: 'building',
      geometry: polygon,
      attributes: [{ key: 'so_tang', value: '5' }, { key: 'SO_TANG', value: '6' }],
    });
    expect(errors.attributes).toMatch(/trùng/);
  });
  it('hợp lệ với dữ liệu đầy đủ', () => {
    const errors = validateFeatureInput({
      name: 'Tòa nhà A',
      category: 'building',
      status: 'active',
      geometry: polygon,
      attributes: [{ key: 'so_tang', value: '5' }],
    });
    expect(errors).toEqual({});
  });
});
