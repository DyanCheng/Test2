## Chạy ứng dụng
Chạy lệnh `npx expo start` và chọn nền tảng Android, iOS hoặc web.

## Các tính năng đã triển khai

- Dữ liệu mẫu (seed data): 3 danh mục và 5 món ăn.
- Các thao tác với món ăn: tạo mới, chỉnh sửa, xem chi tiết và xóa (có xác nhận); quản lý danh mục với cơ chế ngăn chặn xóa danh mục đang được sử dụng.
- Tìm kiếm, bộ lọc kết hợp, sắp xếp; trạng thái được lưu trữ trong `AsyncStorage`.
- Hỗ trợ nhiều URL hình ảnh, một ảnh thu nhỏ (thumbnail) cố định, trạng thái khả dụng (availability) và tùy chọn hiển thị (Nhanh/Thông thường).
- Tùy chọn ngôn ngữ (Anh/Việt) được lưu cục bộ.
- Cơ chế xử lý dữ liệu ưu tiên ngoại tuyến (offline-first) với hàng đợi thay đổi bền vững. `NetInfo` tự động kích hoạt đồng bộ hóa khi có kết nối Internet; các thao tác với `MockAPI` nếu thất bại sẽ vẫn nằm trong hàng đợi, giúp ngăn chặn việc trùng lặp dữ liệu.

## Cấu trúc dự án

- `src/types` - các mô hình dữ liệu (data models).
- `src/services` - quản lý dữ liệu mẫu/lưu trữ bền vững qua `AsyncStorage` và bộ điều hợp (adapter) cho `MockAPI` (REST).
- `src/context` - quản lý trạng thái, logic xác thực, hàng đợi ngoại tuyến và đồng bộ hóa dữ liệu.
- `src/screens` - giao diện hiển thị và tương tác người dùng.