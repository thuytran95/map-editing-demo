/** Chọn nội dung cho tab "Thuộc tính": form của bản nháp/đối tượng được chọn, hoặc lời nhắc. */
import { useAtomValue } from 'jotai';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { draftFeatureAtom, editingFeatureAtom } from '../store/atoms.js';
import FeatureForm from './FeatureForm.jsx';

export default function EditorPanel() {
  const editing = useAtomValue(editingFeatureAtom);
  const draft = useAtomValue(draftFeatureAtom);

  if (!editing) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Chọn một đối tượng trên bản đồ/danh sách, hoặc dùng công cụ vẽ (điểm, đường, vùng) để tạo mới.
        </Typography>
      </Box>
    );
  }
  // key thay đổi khi chuyển sang đối tượng khác -> form được khởi tạo lại với dữ liệu mới
  return (
    <FeatureForm
      key={editing.id ?? `new-${editing.clientKey}`}
      feature={editing}
      geometryChanged={Boolean(draft && draft.id)}
    />
  );
}
