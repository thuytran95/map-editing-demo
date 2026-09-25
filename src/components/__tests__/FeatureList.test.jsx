import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import FeatureList from '../FeatureList.jsx';
import { listFeatures } from '../../api/featureApi.js';

// Giả lập (mock) module gọi API -> test không cần chạy server thật
vi.mock('../../api/featureApi.js', () => ({ listFeatures: vi.fn() }));

const feature = (id, name, category = 'building') => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [105.78, 21.02] },
  properties: { name, category, status: 'active', attributes: [] },
});

const renderList = () =>
  render(
    <Provider>
      <FeatureList />
    </Provider>,
  );

beforeEach(() => {
  vi.mocked(listFeatures).mockReset();
});

describe('FeatureList', () => {
  it('hiển thị danh sách lấy từ API', async () => {
    vi.mocked(listFeatures).mockResolvedValue({
      data: [feature('a', 'Tòa nhà A'), feature('b', 'Hồ B', 'water')],
      pagination: { page: 1, limit: 8, total: 2, totalPages: 1 },
    });
    renderList();
    expect(await screen.findByText('Tòa nhà A')).toBeInTheDocument();
    expect(screen.getByText('Hồ B')).toBeInTheDocument();
    expect(screen.getByText('Tìm thấy 2 đối tượng')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi API lỗi', async () => {
    vi.mocked(listFeatures).mockRejectedValue(new Error('Không kết nối được API'));
    renderList();
    expect(await screen.findByText('Không kết nối được API')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('gọi API với từ khóa tìm kiếm sau khi người dùng ngừng gõ', async () => {
    vi.mocked(listFeatures).mockResolvedValue({ data: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 } });
    renderList();
    await userEvent.type(screen.getByLabelText('Tìm kiếm'), 'hồ');
    await waitFor(
      () => expect(listFeatures).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'hồ', page: 1 })),
      { timeout: 2000 },
    );
  });
});
