/**
 * Danh sách đối tượng: tìm kiếm (debounce), lọc theo loại, phân trang phía server.
 * Xử lý đủ 3 trạng thái khi gọi API: đang tải (loading) - lỗi (error) - có dữ liệu.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { CATEGORIES } from '../../shared/constants.js';
import { listFeatures } from '../api/featureApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import {
  categoryFilterAtom,
  draftFeatureAtom,
  focusRequestAtom,
  listVersionAtom,
  selectedFeatureIdAtom,
} from '../store/atoms.js';
import FeatureListItem from './FeatureListItem.jsx';

export const PAGE_SIZE = 8;

export default function FeatureList() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useAtom(categoryFilterAtom);
  const [selectedId, setSelectedId] = useAtom(selectedFeatureIdAtom);
  const setDraft = useSetAtom(draftFeatureAtom);
  const setFocus = useSetAtom(focusRequestAtom);
  const listVersion = useAtomValue(listVersionAtom);
  const debouncedKeyword = useDebounce(keyword, 400);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let ignore = false; // bỏ qua kết quả của request cũ nếu người dùng đã đổi điều kiện
    setLoading(true);
    setError(null);
    listFeatures({ q: debouncedKeyword, category, page, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return;
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [debouncedKeyword, category, page, listVersion, retry]);

  // useCallback: giữ nguyên tham chiếu để FeatureListItem (memo) không render lại vô ích
  const handleSelect = useCallback(
    (id) => {
      setDraft(null);
      setSelectedId(id);
      setFocus({ id, nonce: Date.now() });
    },
    [setDraft, setSelectedId, setFocus],
  );

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <TextField
          id="search-keyword"
          label="Tìm kiếm"
          placeholder="Tên, mô tả, thuộc tính..."
          size="small"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
        <TextField
          id="filter-category"
          select
          label="Loại đối tượng"
          size="small"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ height: 4, my: 1 }}>{loading && <LinearProgress />}</Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => setRetry((r) => r + 1)}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && (
        <>
          <Typography variant="body2" color="text.secondary">
            Tìm thấy {pagination.total} đối tượng
          </Typography>
          <List dense disablePadding>
            {items.map((feature) => (
              <FeatureListItem
                key={feature.id}
                feature={feature}
                selected={feature.id === selectedId}
                onSelect={handleSelect}
              />
            ))}
          </List>
          {!loading && items.length === 0 && (
            <Typography sx={{ mt: 2 }} color="text.secondary" align="center">
              Không có đối tượng phù hợp
            </Typography>
          )}
          {pagination.totalPages > 1 && (
            <Pagination
              sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
              count={pagination.totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
            />
          )}
        </>
      )}
    </Box>
  );
}
