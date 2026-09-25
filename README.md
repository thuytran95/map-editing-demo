# Map Editing Demo – Project minh họa thực tập tốt nghiệp

Project minh họa các kỹ thuật front-end mà sinh viên **Trần Thu Thủy (B23DTCN220)** đã học và áp dụng
trong thời gian thực tập tại dự án *Map Editing System* (Công ty Cổ phần Kaopiz Holdings, SBU5).

> Mã nguồn dự án thật thuộc khách hàng và được bảo mật theo quy định của công ty, nên **không** được
> đưa vào báo cáo. Project này được xây dựng lại **từ đầu**, với dữ liệu giả lập, để trình bày và
> chạy thử các kỹ thuật tương đương: ReactJS, OpenLayers, Jotai, Material UI, gọi API bằng axios,
> tối ưu hiệu năng (memo / useCallback / useMemo) và kiểm thử bằng React Testing Library.

## 1. Chức năng

| Nhóm | Chức năng |
|---|---|
| Bản đồ | Hiển thị nền OpenStreetMap, lớp đối tượng (điểm / đường / vùng) tô màu theo loại, thước tỉ lệ, tọa độ con trỏ (EPSG:4326) |
| Chọn đối tượng | Nhấp trên bản đồ hoặc trong danh sách; bản đồ tự “bay” tới đối tượng |
| Tạo mới | Vẽ điểm, đường, vùng (OpenLayers `Draw`), bắt điểm (`Snap`), Esc để hủy |
| Chỉnh sửa hình học | Kéo, thêm, xóa đỉnh (`Modify`), đồng bộ tọa độ 3857 ⇄ 4326 |
| Thuộc tính | Form nhập liệu có kiểm tra dữ liệu, **form động** thêm/xóa thuộc tính mở rộng, tự tính diện tích/chiều dài |
| Danh sách | Tìm kiếm không phân biệt dấu (debounce), lọc theo loại, **phân trang phía server**, trạng thái loading/lỗi/thử lại |
| API | REST API Node.js + Express, lưu dữ liệu GeoJSON vào file JSON, kiểm tra dữ liệu phía server |
| Kiểm thử | 24 test: validation, tiện ích tọa độ, API (supertest), component (React Testing Library) |

## 2. Công nghệ

- **Front-end:** React 18, Vite 5, OpenLayers 9, Jotai 2, Material UI 5, axios
- **Back-end (API giả lập):** Node.js, Express 4
- **Kiểm thử:** Vitest, React Testing Library, jsdom, supertest

## 3. Cài đặt và chạy (Windows / macOS / Linux)

### Bước 1 – Cài phần mềm cần thiết (làm 1 lần)
1. **Node.js bản LTS (20 hoặc 22)**: tải tại <https://nodejs.org> → cài đặt mặc định (Next liên tục).
   Kiểm tra: mở *Command Prompt* (cmd) gõ `node -v` và `npm -v` – thấy số phiên bản là được.
2. **Visual Studio Code** (khuyến nghị): <https://code.visualstudio.com>.
3. Máy cần **kết nối Internet** khi cài thư viện và để tải nền bản đồ OpenStreetMap.

### Bước 2 – Mở project
- Mở VS Code → *File → Open Folder…* → chọn thư mục `map-editing-demo`.
- Mở Terminal trong VS Code: *Terminal → New Terminal* (hoặc `Ctrl + ~`).

### Bước 3 – Cài thư viện (làm 1 lần)
```bash
npm install
```
Lệnh này đọc `package.json` và tải các thư viện vào thư mục `node_modules` (mất 1–3 phút).

### Bước 4 – Chạy ứng dụng
```bash
npm run dev
```
Lệnh chạy đồng thời 2 tiến trình:
- `[api]` – API Node.js tại <http://localhost:4000/api>
- `[web]` – giao diện React (Vite) tại <http://localhost:5173> (trình duyệt tự mở)

Dừng chương trình: bấm `Ctrl + C` trong Terminal.

### Bước 5 – Chạy kiểm thử
```bash
npm test
```
Kết quả mong đợi: tất cả test **passed** (màu xanh).

### Các lệnh khác
| Lệnh | Ý nghĩa |
|---|---|
| `npm run seed` | Khôi phục dữ liệu mẫu ban đầu (dừng `npm run dev` trước) |
| `npm run server` / `npm run client` | Chạy riêng API / riêng giao diện |
| `npm run build` | Đóng gói giao diện vào thư mục `dist/` |

## 4. Kịch bản thao tác để chụp ảnh đưa vào báo cáo (mục 5.4.4)

1. **Màn hình tổng quan:** mở ứng dụng, tab *Danh sách* hiện 14 đối tượng mẫu, bản đồ khu vực Hà Nội.
2. **Tìm kiếm & lọc:** gõ `ho dieu` (không dấu) → tìm thấy “Hồ điều hòa F1”; chọn *Loại = Tòa nhà*.
3. **Chọn đối tượng:** nhấp “Tòa nhà văn phòng A1” trong danh sách → bản đồ bay tới, tô viền đỏ.
4. **Vẽ vùng mới:** chọn công cụ *Vẽ vùng* → nhấp các đỉnh → nhấp đúp để kết thúc → form *Tạo mới* hiện diện tích.
5. **Kiểm tra dữ liệu:** bấm *Lưu* khi chưa nhập tên → thấy thông báo lỗi dưới ô *Tên đối tượng*.
6. **Form động:** bấm *+ Thêm thuộc tính* 2 lần, nhập `so_tang = 5`, `chu_dau_tu = ABC` → *Lưu*.
7. **Sửa hình học:** chọn một vùng → công cụ *Sửa hình* → kéo một đỉnh → thấy cảnh báo “Hình học đã thay đổi” và diện tích mới → *Lưu*.
8. **Trạng thái lỗi:** dừng API (Ctrl + C) rồi chạy `npm run client` → danh sách báo “Không kết nối được API” và nút *Thử lại*.
9. **Kiểm thử:** chạy `npm test` và chụp màn hình kết quả.

## 5. Cấu trúc thư mục

```
map-editing-demo/
├─ shared/                     # Dùng chung client + server
│  ├─ constants.js             # Loại đối tượng, trạng thái, kiểu hình học
│  └─ featureValidation.js     # Kiểm tra dữ liệu (tên, loại, thuộc tính, GeoJSON)
├─ server/                     # API Node.js + Express
│  ├─ index.js                 # Khởi động server (cổng 4000)
│  ├─ app.js                   # Định nghĩa các route REST
│  ├─ store.js                 # Lưu/đọc dữ liệu GeoJSON từ file JSON
│  ├─ textSearch.js            # Tìm kiếm tiếng Việt không dấu
│  ├─ seed.js                  # Khôi phục dữ liệu mẫu
│  └─ data/seed.json           # 14 đối tượng mẫu (giả lập)
├─ src/                        # Giao diện React
│  ├─ main.jsx, App.jsx        # Điểm vào, bố cục chính
│  ├─ api/                     # axios instance + hàm gọi API
│  ├─ store/atoms.js           # State toàn cục bằng Jotai
│  ├─ hooks/                   # useFeatureActions, useDebounce
│  ├─ utils/geo.js             # Chuyển đổi tọa độ, đo diện tích/chiều dài
│  └─ components/              # MapView, MapToolbar, FeatureList, FeatureForm, ...
├─ docs/diagrams/              # Mã nguồn sơ đồ (Mermaid) dùng trong báo cáo
├─ package.json, vite.config.js, index.html
└─ README.md
```

## 6. Luồng dữ liệu chính

```
Người dùng vẽ/sửa trên bản đồ (OpenLayers, EPSG:3857)
   → utils/geo.js chuyển sang GeoJSON (EPSG:4326)
   → draftFeatureAtom (Jotai) → FeatureForm hiển thị & kiểm tra dữ liệu
   → useFeatureActions.save() → axios POST/PUT /api/features
   → Express kiểm tra lại (shared/featureValidation.js) → lưu file JSON
   → cập nhật featuresAtom → MapView & FeatureList tự hiển thị lại
```

## 7. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `'npm' is not recognized…` | Chưa cài Node.js hoặc chưa mở lại Terminal/VS Code sau khi cài |
| PowerShell báo `running scripts is disabled on this system` | Dùng *Command Prompt* thay PowerShell, hoặc chạy 1 lần: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `EADDRINUSE: address already in use :::4000` (hoặc 5173) | Một bản khác đang chạy – tắt Terminal cũ, hoặc đổi cổng: `set PORT=4001` (cmd) rồi sửa `vite.config.js` cho khớp |
| Bản đồ nền trắng, chỉ thấy các hình | Máy không truy cập được tile.openstreetmap.org (mạng chặn) – dữ liệu vẫn chỉnh sửa bình thường |
| Danh sách báo “Không kết nối được API” | API chưa chạy – dùng `npm run dev` (không phải chỉ `npm run client`) |
| Muốn làm lại từ dữ liệu ban đầu | Dừng chương trình → `npm run seed` → `npm run dev` |
