/**
 * Quản lý state toàn cục bằng Jotai.
 * Mỗi atom là một "mẩu" state nhỏ; component nào cần thì dùng useAtom / useAtomValue / useSetAtom.
 * Atom dẫn xuất (derived atom) tự tính lại khi atom gốc thay đổi -> tránh lưu state dư thừa.
 */
import { atom } from 'jotai';

/** Toàn bộ đối tượng (GeoJSON Feature, tọa độ EPSG:4326) đang hiển thị trên bản đồ. */
export const featuresAtom = atom([]);

/** id đối tượng đang được chọn. */
export const selectedFeatureIdAtom = atom(null);

/**
 * Bản nháp đang chỉnh sửa (chưa lưu):
 * - đối tượng mới vừa vẽ: id = null
 * - đối tượng cũ vừa sửa hình học: id = id của đối tượng
 */
export const draftFeatureAtom = atom(null);

/** Chế độ thao tác trên bản đồ: select | draw-Point | draw-LineString | draw-Polygon | modify */
export const editModeAtom = atom('select');

/** Bộ lọc loại đối tượng dùng chung cho danh sách và bản đồ. */
export const categoryFilterAtom = atom('all');

/** Tab đang mở ở panel trái: list | form */
export const panelTabAtom = atom('list');

/** Tăng giá trị để yêu cầu danh sách tải lại (sau khi thêm/sửa/xóa). */
export const listVersionAtom = atom(0);

/** Yêu cầu bản đồ "bay" tới một đối tượng: { id, nonce } */
export const focusRequestAtom = atom(null);

/** Thông báo dạng Snackbar: { severity: 'success'|'error'|'info', message } */
export const notificationAtom = atom(null);

// ----------------- Atom dẫn xuất -----------------

export const selectedFeatureAtom = atom((get) => {
  const id = get(selectedFeatureIdAtom);
  return id ? get(featuresAtom).find((f) => f.id === id) ?? null : null;
});

/** Đối tượng đang hiển thị trong form: ưu tiên bản nháp, sau đó tới đối tượng được chọn. */
export const editingFeatureAtom = atom((get) => get(draftFeatureAtom) ?? get(selectedFeatureAtom));

/** Các đối tượng được vẽ trên bản đồ theo bộ lọc loại. */
export const visibleFeaturesAtom = atom((get) => {
  const category = get(categoryFilterAtom);
  const features = get(featuresAtom);
  return category === 'all' ? features : features.filter((f) => f.properties?.category === category);
});
