/**
 * Form xem/sửa thuộc tính của một đối tượng bản đồ (tạo mới hoặc cập nhật).
 * - Kiểm tra dữ liệu phía client bằng hàm dùng chung với server (shared/featureValidation.js)
 * - Hiển thị lỗi theo từng trường; lỗi từ server (400) cũng được ánh xạ về đúng trường
 * - useMemo: chỉ tính lại số đo (diện tích/chiều dài) khi hình học thay đổi
 */
import { useCallback, useMemo, useState } from 'react';
import { useSetAtom } from 'jotai';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { CATEGORIES, STATUSES } from '../../shared/constants.js';
import { validateFeatureInput } from '../../shared/featureValidation.js';
import { useFeatureActions } from '../hooks/useFeatureActions.js';
import { draftFeatureAtom, editModeAtom, selectedFeatureIdAtom } from '../store/atoms.js';
import { countVertices, describeMeasure, GEOMETRY_LABELS } from '../utils/geo.js';
import AttributeFields from './AttributeFields.jsx';

let uidCounter = 0;
const nextUid = () => `row${(uidCounter += 1)}`;

function toFormState(feature) {
  const p = feature.properties ?? {};
  return {
    name: p.name ?? '',
    category: p.category ?? '',
    status: p.status ?? 'draft',
    description: p.description ?? '',
    attributes: (p.attributes ?? []).map((a) => ({ uid: nextUid(), key: a.key, value: a.value })),
  };
}

export default function FeatureForm({ feature, geometryChanged = false }) {
  const isNew = !feature.id;
  const [values, setValues] = useState(() => toFormState(feature));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  const setDraft = useSetAtom(draftFeatureAtom);
  const setSelectedId = useSetAtom(selectedFeatureIdAtom);
  const setMode = useSetAtom(editModeAtom);
  const { save, remove } = useFeatureActions();

  const measureText = useMemo(() => describeMeasure(feature.geometry), [feature.geometry]);
  const vertexCount = useMemo(() => countVertices(feature.geometry), [feature.geometry]);

  const handleField = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));

  const handleAttrChange = useCallback((index, field, value) => {
    setValues((v) => ({
      ...v,
      attributes: v.attributes.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  }, []);
  const handleAttrAdd = useCallback(() => {
    setValues((v) => ({ ...v, attributes: [...v.attributes, { uid: nextUid(), key: '', value: '' }] }));
  }, []);
  const handleAttrRemove = useCallback((index) => {
    setValues((v) => ({ ...v, attributes: v.attributes.filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const attributes = values.attributes.map(({ key, value }) => ({ key: key.trim(), value }));
    const input = { ...values, name: values.name.trim(), attributes, geometry: feature.geometry };
    const clientErrors = validateFeatureInput(input);
    setErrors(clientErrors);
    setServerError(null);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      await save({
        type: 'Feature',
        id: feature.id ?? undefined,
        geometry: feature.geometry,
        properties: {
          name: input.name,
          category: values.category,
          status: values.status,
          description: values.description,
          attributes,
        },
      });
      setMode('select');
    } catch (err) {
      setServerError(err.message);
      if (err.details) setErrors(err.details);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(null); // bỏ bản nháp -> bản đồ hiển thị lại hình học cũ
    if (isNew) setSelectedId(null);
    setMode('select');
  };

  const handleDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Xóa đối tượng "${values.name}"?`)) return;
    try {
      await remove(feature.id);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isNew ? 'Tạo mới đối tượng' : 'Thuộc tính đối tượng'}
      </Typography>

      <Alert severity={isNew ? 'info' : 'success'} icon={false} sx={{ mb: 2 }}>
        Hình học: <b>{GEOMETRY_LABELS[feature.geometry?.type] ?? '—'}</b> · {vertexCount} đỉnh
        {measureText && <> · {measureText}</>}
      </Alert>

      {geometryChanged && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Hình học đã thay đổi trên bản đồ - nhấn <b>Lưu</b> để cập nhật hoặc <b>Hủy</b> để hoàn tác.
        </Alert>
      )}

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}
      {errors.geometry && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errors.geometry}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          id="feature-name"
          label="Tên đối tượng"
          required
          size="small"
          value={values.name}
          onChange={handleField('name')}
          error={Boolean(errors.name)}
          helperText={errors.name}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          id="feature-category"
          select
          label="Loại đối tượng"
          required
          size="small"
          value={values.category}
          onChange={handleField('category')}
          error={Boolean(errors.category)}
          helperText={errors.category}
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="feature-status"
          select
          label="Trạng thái"
          size="small"
          value={values.status}
          onChange={handleField('status')}
        >
          {STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="feature-description"
          label="Mô tả"
          size="small"
          multiline
          minRows={2}
          value={values.description}
          onChange={handleField('description')}
        />

        <Divider />
        <AttributeFields
          rows={values.attributes}
          onChange={handleAttrChange}
          onAdd={handleAttrAdd}
          onRemove={handleAttrRemove}
          error={errors.attributes}
        />
        <Divider />

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
          <Button variant="outlined" onClick={handleCancel} disabled={saving}>
            Hủy
          </Button>
          {!isNew && (
            <Button color="error" onClick={handleDelete} disabled={saving} sx={{ ml: 'auto !important' }}>
              Xóa
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
