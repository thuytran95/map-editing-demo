// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { countVertices, formatArea, formatLength, measureGeometry, toGeoJSONGeometry, toOlFeature, DRAFT_ID } from './geo.js';

const square = {
  type: 'Polygon',
  coordinates: [[[105.78, 21.02], [105.781, 21.02], [105.781, 21.021], [105.78, 21.021], [105.78, 21.02]]],
};

describe('định dạng số đo', () => {
  it('formatArea chọn đơn vị phù hợp', () => {
    expect(formatArea(500)).toBe('500 m²');
    expect(formatArea(25000)).toBe('2.50 ha');
    expect(formatArea(3_000_000)).toBe('3.00 km²');
  });
  it('formatLength chọn đơn vị phù hợp', () => {
    expect(formatLength(850)).toBe('850 m');
    expect(formatLength(1500)).toBe('1.50 km');
  });
});

describe('đo đạc và chuyển đổi tọa độ', () => {
  it('ô vuông 0.001° tại vĩ độ 21° có diện tích khoảng 11.500 m²', () => {
    const { kind, value } = measureGeometry(square);
    expect(kind).toBe('area');
    expect(value).toBeGreaterThan(11000);
    expect(value).toBeLessThan(12000);
  });

  it('chuyển GeoJSON -> OpenLayers (3857) -> GeoJSON (4326) giữ nguyên tọa độ', () => {
    const olFeature = toOlFeature({ type: 'Feature', id: null, geometry: square, properties: { name: 'A' } });
    expect(olFeature.getId()).toBe(DRAFT_ID);
    // Trong EPSG:3857 tọa độ tính bằng mét nên rất lớn
    expect(Math.abs(olFeature.getGeometry().getFirstCoordinate()[0])).toBeGreaterThan(1e6);
    const back = toGeoJSONGeometry(olFeature.getGeometry());
    expect(back.coordinates[0][1][0]).toBeCloseTo(105.781, 6);
    expect(back.coordinates[0][1][1]).toBeCloseTo(21.02, 6);
  });

  it('đếm số đỉnh', () => {
    expect(countVertices(square)).toBe(4);
    expect(countVertices({ type: 'Point', coordinates: [1, 2] })).toBe(1);
  });
});
