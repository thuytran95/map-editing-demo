/**
 * Một dòng trong danh sách. Bọc React.memo: khi danh sách render lại (vd. đổi đối tượng được chọn)
 * chỉ những dòng có props thay đổi mới render lại -> tối ưu hiệu năng với danh sách dài.
 */
import { memo } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import { CATEGORIES, STATUSES } from '../../shared/constants.js';
import { GEOMETRY_ICONS } from './icons.jsx';

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

function FeatureListItem({ feature, selected, onSelect }) {
  const { name, category, status } = feature.properties;
  const Icon = GEOMETRY_ICONS[feature.geometry?.type] ?? GEOMETRY_ICONS.Point;
  const cat = CATEGORY_MAP[category];

  return (
    <ListItemButton selected={selected} onClick={() => onSelect(feature.id)} divider>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Icon sx={{ color: cat?.color ?? 'grey.600' }} />
      </ListItemIcon>
      <ListItemText primary={name} secondary={cat?.label ?? 'Chưa phân loại'} />
      <Chip size="small" label={STATUS_MAP[status] ?? status} variant={status === 'active' ? 'filled' : 'outlined'} />
    </ListItemButton>
  );
}

export default memo(FeatureListItem);
