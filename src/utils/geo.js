/**
 * Tiện ích chuyển đổi dữ liệu giữa GeoJSON (API, EPSG:4326 - kinh/vĩ độ)
 * và đối tượng OpenLayers (bản đồ, EPSG:3857 - Web Mercator, đơn vị mét).
 * Đây là điểm mấu chốt để "đồng bộ tọa độ" giữa bản đồ và dữ liệu hệ thống.
 */
import GeoJSON from 'ol/format/GeoJSON.js';
import { getArea, getLength } from 'ol/sphere.js';

export const DRAFT_ID = '__draft__';
export const DATA_PROJECTION = 'EPSG:4326';
export const MAP_PROJECTION = 'EPSG:3857';

const mapFormat = new GeoJSON({ dataProjection: DATA_PROJECTION, featureProjection: MAP_PROJECTION });
const plainFormat = new GeoJSON(); // đọc hình học giữ nguyên EPSG:4326 (dùng để đo đạc)

/** GeoJSON Feature (4326) -> ol/Feature (3857). Bản nháp chưa có id được gán DRAFT_ID. */
export function toOlFeature(feature) {
  const olFeature = mapFormat.readFeature(feature);
  olFeature.setId(feature.id ?? DRAFT_ID);
  return olFeature;
}

/** ol/geom (3857) -> GeoJSON geometry (4326), làm tròn 7 chữ số thập phân (~1 cm). */
export function toGeoJSONGeometry(olGeometry) {
  return mapFormat.writeGeometryObject(olGeometry, { decimals: 7 });
}

/** Đo diện tích (m²) cho vùng, chiều dài (m) cho đường; điểm trả về null. Tính trên mặt cầu. */
export function measureGeometry(geometry) {
  if (!geometry) return null;
  const olGeometry = plainFormat.readGeometry(geometry);
  if (geometry.type === 'Polygon') return { kind: 'area', value: getArea(olGeometry, { projection: DATA_PROJECTION }) };
  if (geometry.type === 'LineString') return { kind: 'length', value: getLength(olGeometry, { projection: DATA_PROJECTION }) };
  return null;
}

export function formatArea(m2) {
  if (m2 >= 1e6) return `${(m2 / 1e6).toFixed(2)} km²`;
  if (m2 >= 1e4) return `${(m2 / 1e4).toFixed(2)} ha`;
  return `${Math.round(m2)} m²`;
}

export function formatLength(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

export function describeMeasure(geometry) {
  const measure = measureGeometry(geometry);
  if (!measure) return null;
  return measure.kind === 'area' ? `Diện tích: ${formatArea(measure.value)}` : `Chiều dài: ${formatLength(measure.value)}`;
}

/** Số đỉnh của hình học (hiển thị thông tin cho người biên tập). */
export function countVertices(geometry) {
  if (!geometry) return 0;
  if (geometry.type === 'Point') return 1;
  if (geometry.type === 'LineString') return geometry.coordinates.length;
  if (geometry.type === 'Polygon') return geometry.coordinates[0].length - 1; // không tính điểm khép kín
  return 0;
}

export const GEOMETRY_LABELS = { Point: 'Điểm', LineString: 'Đường', Polygon: 'Vùng' };