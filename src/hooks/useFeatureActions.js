/**
 * Gom các thao tác nghiệp vụ (tải, lưu, xóa) vào một custom hook.
 * Component chỉ gọi save()/remove() mà không cần biết chi tiết API và cách cập nhật atom.
 * useCallback giữ nguyên tham chiếu hàm giữa các lần render -> tránh render lại không cần thiết.
 */
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import { createFeature, deleteFeature, fetchAllFeatures, updateFeature } from '../api/featureApi.js';
import {
  draftFeatureAtom,
  featuresAtom,
  listVersionAtom,
  notificationAtom,
  selectedFeatureIdAtom,
} from '../store/atoms.js';

export function useFeatureActions() {
  const setFeatures = useSetAtom(featuresAtom);
  const setDraft = useSetAtom(draftFeatureAtom);
  const setSelectedId = useSetAtom(selectedFeatureIdAtom);
  const bumpListVersion = useSetAtom(listVersionAtom);
  const notify = useSetAtom(notificationAtom);

  const reloadAll = useCallback(async () => {
    try {
      setFeatures(await fetchAllFeatures());
    } catch (error) {
      notify({ severity: 'error', message: error.message });
    }
  }, [setFeatures, notify]);

  /** Lưu đối tượng: chưa có id -> tạo mới, có id -> cập nhật. Lỗi được ném ra cho form xử lý. */
  const save = useCallback(
    async (feature) => {
      const isNew = !feature.id;
      const saved = isNew ? await createFeature(feature) : await updateFeature(feature.id, feature);
      setFeatures((prev) =>
        isNew ? [saved, ...prev] : prev.map((f) => (f.id === saved.id ? saved : f)),
      );
      setDraft(null);
      setSelectedId(saved.id);
      bumpListVersion((v) => v + 1);
      notify({ severity: 'success', message: isNew ? 'Đã tạo mới đối tượng' : 'Đã cập nhật đối tượng' });
      return saved;
    },
    [setFeatures, setDraft, setSelectedId, bumpListVersion, notify],
  );

  const remove = useCallback(
    async (id) => {
      await deleteFeature(id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      setDraft(null);
      setSelectedId(null);
      bumpListVersion((v) => v + 1);
      notify({ severity: 'success', message: 'Đã xóa đối tượng' });
    },
    [setFeatures, setDraft, setSelectedId, bumpListVersion, notify],
  );

  return { reloadAll, save, remove };
}
