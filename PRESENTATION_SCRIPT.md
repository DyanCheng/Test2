# Kịch bản thuyết trình Lesson5 - Quản lý khóa học

Thời lượng gợi ý: 8-12 phút. Các đoạn trong ngoặc vuông là thao tác demo.

## 1. Mở đầu

"Em xin trình bày Lesson5, ứng dụng Quản lý khóa học xây dựng bằng Expo React Native. Mục tiêu là thực hành CRUD với REST API, xử lý JSON, hiển thị ảnh URL và phát trailer video. Backend của ứng dụng là MockAPI, không dùng danh sách khóa học hardcode."

[Mở màn hình danh sách.]

"MockAPI hiện có hai resource: `categories` và `courses`. API có 3 danh mục và 10 khóa học mẫu."

## 2. Kiến trúc mã nguồn

"Ứng dụng chia thành ba lớp:

```text
Màn hình React Native → src/lib/mockapi.ts → MockAPI REST API
```

Các màn hình chỉ quản lý giao diện/state. File `mockapi.ts` tập trung base URL, HTTP request, parse JSON và lỗi HTTP. Kiểu `Course` và `Category` nằm trong `src/types/course.ts`. Nhờ vậy, nếu đổi backend chỉ cần sửa một nơi."

## 3. Dữ liệu và quan hệ

"Category gồm `id`, `name`, `description`. Course gồm `title`, `description`, `categoryId`, `instructor`, `price`, `duration`, `thumbnail`, `trailerUrl`, `createdAt` và `id`.

`categoryId` biểu diễn quan hệ một-nhiều: một danh mục có nhiều khóa học. Khi cần hiển thị tên danh mục, app tải cả courses và categories, rồi tìm category có `id` bằng `course.categoryId`; không hardcode tên danh mục."

## 4. Trọng tâm: gọi API và xử lý dữ liệu trả về

"File quan trọng nhất là `src/lib/mockapi.ts`. Em khai báo base URL:

```ts
export const MOCK_API_BASE_URL =
  "https://6acde706f338359cf1c29350.mockapi.io";
```

Tất cả endpoint dùng chung hàm `request`:

```ts
const response = await fetch(`${MOCK_API_BASE_URL}/${path}`, {
  ...init,
  headers: { "Content-Type": "application/json", ... },
});

if (!response.ok) {
  throw new Error(`MockAPI request failed (${response.status}).`);
}
return await response.json();
```

Quy trình là: `fetch` gửi request bất đồng bộ, `await` chờ response, `response.ok` kiểm tra HTTP 2xx, rồi `response.json()` chuyển JSON thành object JavaScript. Nếu server trả 404 hoặc 500, hàm throw error để màn hình hiện thông báo lỗi thay vì coi là thành công.

API trả JSON là dữ liệu bên ngoài nên không tin tuyệt đối về kiểu. Vì vậy app có `toCourse` để chuẩn hóa:

```ts
price: number(value.price),
duration: number(value.duration),
```

Hàm `number` chuyển text/number sang số và trả về 0 nếu không hợp lệ. Hàm `text` bảo đảm trường chuỗi không bị lỗi nếu server trả `null`. Nhờ vậy UI luôn nhận dữ liệu đúng với kiểu TypeScript `Course`."

[Mở `src/lib/mockapi.ts`, chỉ lần lượt `request`, `toCourse`, `getCourses`.]

## 5. GET: danh sách, tìm kiếm và lọc

"Màn hình chính gọi hai request song song:

```ts
const [nextCourses, nextCategories] = await Promise.all([
  getCourses(),
  getCategories(),
]);
```

`Promise.all` phù hợp vì hai request độc lập; app chờ cả hai để có đủ dữ liệu hiển thị khóa học và tên danh mục. Khi thành công app gọi `setCourses` và `setCategories`; khi thất bại, `catch` chuyển sang trạng thái lỗi và hiện nút Thử lại.

State `loading` hiển thị spinner. `RefreshControl` gọi lại API khi kéo để làm mới. Tìm kiếm và lọc làm trên dữ liệu đã tải bằng `useMemo`: tìm theo `course.title`, lọc theo `course.categoryId`."

[Demo: tìm Flutter, chọn danh mục Mobile, kéo để refresh.]

## 6. Chi tiết và trailer

"Chạm vào khóa học sẽ đi đến `/course/[id]`. `useLocalSearchParams` lấy id và app gọi `getCourse(id)` kết hợp `getCategories()` để hiển thị đủ thông tin.

`CourseImage` hiển thị ảnh URL; nếu URL rỗng hoặc tải lỗi, component dùng ảnh thay thế nên giao diện không vỡ. Khi chọn Xem trailer, `expo-video` với `useVideoPlayer` và `VideoView` phát URL MP4 trực tiếp trong ứng dụng, có điều khiển native và fullscreen."

[Demo: mở chi tiết, bấm Xem trailer.]

## 7. POST: thêm khóa học

"Form tải danh mục từ API để người dùng chọn. Trước khi lưu, app kiểm tra trường bắt buộc, categoryId tồn tại, học phí không âm, thời lượng lớn hơn 0 và hai URL phải là HTTP/HTTPS.

Sau validation, app tạo body JSON:

```ts
request("courses", {
  method: "POST",
  body: JSON.stringify({ ...input, createdAt: new Date().toISOString() }),
});
```

MockAPI trả về bản ghi mới cùng ID do server sinh. App lấy `saved.id` để điều hướng ngay đến chi tiết khóa học vừa thêm."

[Demo: thêm khóa học, chọn danh mục, lưu.]

## 8. PUT: sửa khóa học

"Nếu form có id, app là chế độ sửa: GET dữ liệu cũ và điền vào TextInput. Khi lưu, app dùng `PUT /courses/:id` với `cleanCourseInput`, giúp trim khoảng trắng thừa. Response trả về khóa học đã cập nhật; app quay về chi tiết. Khi quay lại danh sách, `useFocusEffect` tải dữ liệu mới nhất."

[Demo: sửa học phí và giảng viên, lưu, quay về danh sách.]

## 9. DELETE và tính toàn vẹn dữ liệu

"Nút xóa không gọi DELETE ngay. App hiển thị `ConfirmDialog`; chỉ khi chọn Có, callback mới gọi `deleteCourse(id)`. Nếu thành công, app `router.replace('/')` để không còn hiển thị trang chi tiết của dữ liệu đã xóa.

MockAPI không enforce khóa ngoại. Vì vậy trước khi xóa danh mục, app kiểm tra:

```ts
courses.some(course => course.categoryId === category.id)
```

Nếu còn khóa học thuộc danh mục, app chặn xóa và giải thích lý do. Điều này tránh dữ liệu mồ côi."

[Demo: thử xóa danh mục Mobile để thấy app chặn; thử xóa danh mục trống nếu có.]

## 10. Xử lý trạng thái

"Mỗi màn hình có ba trạng thái: loading với ActivityIndicator, error với thông báo/nút thử lại, và empty khi kết quả lọc rỗng. Vì vậy app không giả định mạng luôn ổn định và người dùng luôn hiểu trạng thái hiện tại."

## 11. Kết thúc

"Tóm lại, Lesson5 có CRUD khóa học/danh mục, REST API thật, xử lý JSON an toàn, tìm kiếm-lọc, ảnh URL, trailer MP4, validation và xử lý lỗi. Điểm chính là tách lớp API vào `mockapi.ts`, nên giao diện dễ đọc, dễ bảo trì và dễ đổi backend. Em xin cảm ơn."

## Câu hỏi thường gặp

**Vì sao không hardcode dữ liệu?** Vì dữ liệu phải đồng bộ sau CRUD và đề yêu cầu gọi API.

**Vì sao phải dùng `toCourse`?** JSON từ server có thể sai kiểu; hàm này chuẩn hóa trước khi UI dùng.

**Vì sao dùng `Promise.all`?** Courses và categories độc lập, nên tải song song nhanh hơn gọi lần lượt.

**Nếu API lỗi?** `request` kiểm tra `response.ok`, throw error, sau đó màn hình catch để hiện lỗi/nút thử lại.
