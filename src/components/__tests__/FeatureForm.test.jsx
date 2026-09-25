import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import FeatureForm from '../FeatureForm.jsx';
import { createFeature } from '../../api/featureApi.js';

vi.mock('../../api/featureApi.js', () => ({
  createFeature: vi.fn(),
  updateFeature: vi.fn(),
  deleteFeature: vi.fn(),
  fetchAllFeatures: vi.fn(),
}));

const newDraft = {
  type: 'Feature',
  id: null,
  clientKey: 1,
  geometry: { type: 'Point', coordinates: [105.78, 21.02] },
  properties: { name: '', category: 'poi', status: 'draft', description: '', attributes: [] },
};

const renderForm = (feature = newDraft) =>
  render(
    <Provider>
      <FeatureForm feature={feature} />
    </Provider>,
  );

beforeEach(() => vi.mocked(createFeature).mockReset());

describe('FeatureForm', () => {
  it('báo lỗi và không gọi API khi chưa nhập tên', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Vui lòng nhập tên đối tượng')).toBeInTheDocument();
    expect(createFeature).not.toHaveBeenCalled();
  });

  it('thêm và xóa dòng thuộc tính động', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: '+ Thêm thuộc tính' }));
    await userEvent.click(screen.getByRole('button', { name: '+ Thêm thuộc tính' }));
    expect(screen.getAllByLabelText('Tên thuộc tính')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Xóa thuộc tính' })[0]);
    expect(screen.getAllByLabelText('Tên thuộc tính')).toHaveLength(1);
  });

  it('gửi đúng dữ liệu GeoJSON khi hợp lệ', async () => {
    vi.mocked(createFeature).mockImplementation(async (f) => ({ ...f, id: 'f_new' }));
    renderForm();
    await userEvent.type(screen.getByLabelText(/Tên đối tượng/), 'Trạm xe buýt mới');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(createFeature).toHaveBeenCalledTimes(1));
    const sent = vi.mocked(createFeature).mock.calls[0][0];
    expect(sent.geometry).toEqual(newDraft.geometry);
    expect(sent.properties).toMatchObject({ name: 'Trạm xe buýt mới', category: 'poi' });
  });
});
