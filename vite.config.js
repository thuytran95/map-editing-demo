import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite:
// - server.proxy: mọi request bắt đầu bằng /api được chuyển tới API Node.js (cổng 4000),
//   nhờ vậy front-end gọi axios.get('/api/...') mà không bị lỗi CORS.
// - test: cấu hình Vitest (môi trường jsdom giả lập trình duyệt cho React Testing Library).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
  },
});
