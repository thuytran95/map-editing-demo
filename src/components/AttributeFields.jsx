/**
 * Form động: danh sách cặp (tên thuộc tính - giá trị) có thể thêm/xóa tùy ý.
 * Mỗi dòng có "uid" riêng làm key -> React không nhầm dòng khi xóa ở giữa danh sách.
 */
import { memo } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

function AttributeFields({ rows, onChange, onAdd, onRemove, error }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Thuộc tính mở rộng</Typography>
      {rows.map((row, index) => (
        <Stack key={row.uid} direction="row" spacing={1} alignItems="center">
          <TextField
            id={`attr-key-${row.uid}`}
            label="Tên thuộc tính"
            size="small"
            value={row.key}
            onChange={(e) => onChange(index, 'key', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            id={`attr-value-${row.uid}`}
            label="Giá trị"
            size="small"
            value={row.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton aria-label="Xóa thuộc tính" size="small" onClick={() => onRemove(index)}>
            ✕
          </IconButton>
        </Stack>
      ))}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      <Button size="small" onClick={onAdd} sx={{ alignSelf: 'flex-start' }}>
        + Thêm thuộc tính
      </Button>
    </Stack>
  );
}

export default memo(AttributeFields);
