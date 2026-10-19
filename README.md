# Lesson5 - Quản lý khóa học

Ứng dụng Expo React Native quản lý khóa học, dùng MockAPI làm REST backend.

## Chức năng

- Danh sách khóa học: tải từ API, tìm theo tên, lọc theo danh mục, kéo để làm mới.
- Chi tiết khóa học: ảnh bìa, danh mục, giảng viên, mô tả, học phí, thời lượng và trailer MP4.
- Thêm/sửa/xóa khóa học; kiểm tra trường bắt buộc, URL, học phí và thời lượng.
- Quản lý danh mục: thêm, sửa, xóa. Không thể xóa danh mục còn khóa học liên kết.
- Hộp thoại xác nhận trước khi xóa.
- Có loading, lỗi kết nối và danh sách rỗng.

## API

Base URL: `https://6acde706f338359cf1c29350.mockapi.io`

- `GET/POST /categories`
- `PUT/DELETE /categories/:id`
- `GET/POST /courses`
- `GET/PUT/DELETE /courses/:id`

Endpoint được khai báo tập trung tại `src/lib/mockapi.ts`; ứng dụng không hardcode danh sách khóa học hoặc danh mục.

## Chạy dự án

```bash
npm install
npx expo start
```

Chạy web:

```bash
npm run web
```

Kiểm tra mã:

```bash
npx tsc --noEmit
npx expo lint
```

## Lưu ý trailer và ảnh

`thumbnail` và `trailerUrl` là URL chuỗi được lưu ở MockAPI. Trailer nên dùng URL MP4 công khai trực tiếp để phát trong app bằng `expo-video`. Dữ liệu mẫu hiện tại của MockAPI dùng `example.com`, vì thế ảnh/trailer mẫu có thể không phát được cho đến khi thay bằng URL thật.
