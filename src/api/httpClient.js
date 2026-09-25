/**
 * axios instance dùng chung cho toàn bộ ứng dụng.
 * - baseURL '/api': Vite proxy chuyển tiếp tới http://localhost:4000 (xem vite.config.js)
 * - interceptor chuẩn hóa lỗi: component chỉ cần đọc error.message (tiếng Việt)
 */
import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'Máy chủ phản hồi quá lâu, vui lòng thử lại';
      else if (!error.response) message = 'Không kết nối được API (hãy chạy "npm run dev")';
      else message = `Lỗi ${error.response.status}`;
    }
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.details = error.response?.data?.errors; // lỗi theo từng trường từ server
    return Promise.reject(normalized);
  },
);
