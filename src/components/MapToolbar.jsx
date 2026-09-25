/** Thanh công cụ nổi trên bản đồ: chọn chế độ thao tác, bộ lọc loại, tải lại dữ liệu. */
import { memo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { editModeAtom, editingFeatureAtom } from '../store/atoms.js';
import { useFeatureActions } from '../hooks/useFeatureActions.js';
import { EditIcon, LineIcon, PointIcon, PolygonIcon, RefreshIcon, SelectIcon } from './icons.jsx';

const HINTS = {
  select: 'Nhấp vào đối tượng để chọn và xem thuộc tính',
  'draw-Point': 'Nhấp lên bản đồ để đặt điểm (Esc để hủy)',
  'draw-LineString': 'Nhấp để thêm đỉnh, nhấp đúp để kết thúc đường (Esc để hủy)',
  'draw-Polygon': 'Nhấp để thêm đỉnh, nhấp đúp hoặc nhấp lại đỉnh đầu để khép vùng (Esc để hủy)',
  modify: 'Kéo đỉnh để sửa; nhấp vào cạnh để thêm đỉnh; Alt + nhấp để xóa đỉnh',
};

function MapToolbar() {
  const [mode, setMode] = useAtom(editModeAtom);
  const editingFeature = useAtomValue(editingFeatureAtom);
  const { reloadAll } = useFeatureActions();

  return (
    <Paper elevation={3} className="map-toolbar">
      <Stack direction="row" spacing={1} alignItems="center">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(_, value) => value && setMode(value)}
          aria-label="Chế độ thao tác"
        >
          <ToggleButton value="select" aria-label="Chọn">
            <Tooltip title="Chọn đối tượng"><SelectIcon fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton value="draw-Point" aria-label="Vẽ điểm">
            <Tooltip title="Vẽ điểm"><PointIcon fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton value="draw-LineString" aria-label="Vẽ đường">
            <Tooltip title="Vẽ đường"><LineIcon fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton value="draw-Polygon" aria-label="Vẽ vùng">
            <Tooltip title="Vẽ vùng"><PolygonIcon fontSize="small" /></Tooltip>
          </ToggleButton>
          <ToggleButton value="modify" aria-label="Sửa hình" disabled={!editingFeature}>
            <Tooltip title="Sửa hình học của đối tượng đang chọn"><EditIcon fontSize="small" /></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Tải lại dữ liệu từ máy chủ">
          <IconButton size="small" onClick={reloadAll} aria-label="Tải lại">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {HINTS[mode]}
      </Typography>
    </Paper>
  );
}

export default memo(MapToolbar);
