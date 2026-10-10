# Lesson4 — Walkthrough ứng dụng quản lý sinh viên


## 3. Cấu trúc thư mục quan trọng

```text
Lesson4/
├── src/
│   ├── app/
│   │   ├── _layout.tsx              # Cấu hình Stack của Expo Router
│   │   ├── index.tsx                # Trang 1: danh sách sinh viên
│   │   └── student/
│   │       ├── [id].tsx             # Trang 2: chi tiết sinh viên
│   │       └── form.tsx             # Trang 3: thêm / sửa sinh viên
│   ├── components/
│   │   ├── confirm-dialog.tsx       # Dialog xác nhận dùng cho mọi nền tảng
│   │   └── student-avatar.tsx       # Hiển thị ảnh avatar hoặc ảnh thay thế
│   ├── lib/
│   │   ├── supabase.ts              # Khởi tạo Supabase và đăng nhập ẩn danh
│   │   ├── student-database.ts      # Lớp CRUD dữ liệu sinh viên
│   │   └── i18n.ts                  # Chuỗi tiếng Việt / tiếng Anh
│   └── types/student.ts             # Kiểu dữ liệu Student
├── supabase/schema.sql              # Bảng, quyền và RLS trên Supabase
├── .env.example                     # Mẫu biến môi trường
├── app.json                         # Cấu hình tên Lesson4 và Expo plugins
└── package.json                     # Dependencies và scripts
```

## 4. Mô hình dữ liệu

### Kiểu dữ liệu ở ứng dụng

`src/types/student.ts` định nghĩa dữ liệu mà giao diện sử dụng:

```ts
type Student = {
  id: number;
  fullName: string;
  studentCode: string;
  email: string;
  avatarUri: string | null;
};
```

`StudentInput` là dữ liệu nhập vào khi tạo/sửa, không có `id` vì Supabase tự sinh `id`.

### Bảng `students` trong Supabase

Schema trong `supabase/schema.sql` tạo các cột sau:

| Cột | Ý nghĩa |
| --- | --- |
| `id` | Khóa chính, tự tăng. |
| `full_name` | Họ tên sinh viên. |
| `student_code` | Mã số sinh viên. |
| `email` | Email sinh viên. |
| `avatar_uri` | Link ảnh hoặc URI ảnh cục bộ, có thể rỗng. |
| `owner_id` | ID của phiên đăng nhập ẩn danh sở hữu bản ghi. |
| `created_at` | Thời điểm tạo. |

Ràng buộc `unique (owner_id, student_code)` nghĩa là một thiết bị không thể tạo trùng mã số sinh viên của chính nó; các thiết bị khác vẫn có không gian dữ liệu riêng.

## 5. Cấu hình Supabase và bảo mật

### Biến môi trường

Sao chép `.env.example` thành `.env`, sau đó điền thông tin từ Supabase Dashboard → **Connect**:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Không đưa file `.env` lên Git. Hai biến này được `src/lib/supabase.ts` đọc qua `process.env`.

### Đăng nhập ẩn danh

`getAuthenticatedSupabaseClient()` làm việc theo thứ tự:

1. Lấy Supabase client; nếu thiếu biến môi trường thì ném `SupabaseConfigurationError`.
2. Kiểm tra có session hiện tại hay không.
3. Nếu chưa có, gọi `signInAnonymously()` để tạo session không cần email/mật khẩu.
4. Trả về client đã có session để thực hiện truy vấn.

`AsyncStorage` được dùng trên Android/iOS để giữ session khi mở lại ứng dụng. Trên web, Supabase sử dụng cơ chế lưu trữ web mặc định.

Trước khi chạy app, trong Supabase Dashboard cần bật **Authentication → Providers → Anonymous Sign-Ins** và chạy toàn bộ `supabase/schema.sql` trong **SQL Editor**.

### RLS

RLS được bật bằng:

```sql
alter table public.students enable row level security;
```

Sau đó bốn policy `select`, `insert`, `update`, `delete` chỉ cho phép hàng có `owner_id = auth.uid()`. Nhờ đó, client chỉ đọc/sửa/xóa dữ liệu thuộc phiên của chính mình, dù app gọi Supabase trực tiếp từ thiết bị.

## 6. Lớp CRUD: `student-database.ts`

File này tách toàn bộ truy vấn database khỏi giao diện. Nó chuyển đổi giữa tên cột database dạng `snake_case` và dữ liệu TypeScript dạng `camelCase`:

```text
full_name  <-> fullName
student_code <-> studentCode
avatar_uri <-> avatarUri
```

Các hàm chính:

| Hàm | Chức năng |
| --- | --- |
| `getStudents()` | Lấy danh sách, sắp xếp tăng dần theo `full_name`. |
| `getStudent(id)` | Lấy một sinh viên theo `id`; trả về `null` nếu không có. |
| `createStudent(input)` | Thêm bản ghi mới. |
| `updateStudent(id, input)` | Cập nhật bản ghi có `id` tương ứng. |
| `deleteStudent(id)` | Xóa bản ghi có `id` tương ứng. |

Mỗi lệnh tạo/sửa/xóa đều thêm `.select("id")` rồi kiểm tra dữ liệu trả về bằng `requireAffectedRow()`. Đây là điểm quan trọng: nếu RLS, ID sai, hoặc bản ghi đã bị xóa khiến thao tác không ảnh hưởng hàng nào, app sẽ báo lỗi thay vì im lặng coi như thành công.

Luồng chung:

```text
Màn hình
  → hàm CRUD trong student-database.ts
  → getAuthenticatedSupabaseClient()
  → Supabase Auth + RLS
  → bảng students
  → trả kết quả / lỗi về màn hình
```

## 7. Ba màn hình theo yêu cầu

### Trang 1 — Danh sách: `src/app/index.tsx`

Đây là route `/`.

- `useFocusEffect` gọi `loadStudents()` mỗi khi quay lại màn hình, nên danh sách tự làm mới sau khi thêm/sửa/xóa.
- `FlatList` tối ưu việc vẽ danh sách và hiển thị avatar, họ tên, mã số, email.
- Chạm vào phần nội dung thẻ gọi `router.push({ pathname: "/student/[id]", ... })` để mở chi tiết.
- Nút `×` mở `ConfirmDialog`; chỉ khi chọn **Có/Yes** mới gọi `deleteStudent()`.
- Có kéo để làm mới (`RefreshControl`).
- Có trạng thái loading, rỗng và lỗi kết nối/cấu hình.
- Nút “Thêm sinh viên” đi tới `/student/form`.

### Trang 2 — Chi tiết: `src/app/student/[id].tsx`

Đây là route động `/student/:id`.

- `useLocalSearchParams()` đọc ID từ URL.
- `getStudent(id)` tải bản ghi mới nhất khi màn hình được focus.
- Hiển thị avatar, họ tên, mã số và email ở chế độ chỉ đọc.
- Nút **Sửa thông tin** đi tới `/student/form?id=<id>`.
- Nút **Xóa** mở dialog xác nhận. Khi người dùng đồng ý, app xóa bản ghi và `router.replace("/")` để quay về danh sách, không để người dùng ở trang chi tiết của dữ liệu đã xóa.
- Nếu ID không hợp lệ, sinh viên không tồn tại hoặc lỗi kết nối, màn hình cho phép quay về danh sách.

### Trang 3 — Form thêm/sửa: `src/app/student/form.tsx`

Cùng một route `/student/form` được dùng cho hai trường hợp:

- Không có `id`: chế độ **thêm mới**.
- Có `id`: chế độ **sửa**. `getStudent(id)` nạp dữ liệu có sẵn vào các `TextInput`.

Các trường gồm họ tên, mã số, email, link avatar; phần avatar còn có nút chọn ảnh từ thư viện thiết bị.

`handleSubmit()` thực hiện các bước:

1. Xóa khoảng trắng đầu/cuối dữ liệu.
2. Kiểm tra họ tên, mã số, email không rỗng.
3. Kiểm tra email bằng biểu thức `/^\S+@\S+\.\S+$/`.
4. Nếu đang sửa, mở dialog “Bạn có muốn sửa thông tin sinh viên không?”.
5. Nếu đang thêm, gọi `save()` ngay.
6. `save()` gọi `createStudent()` hoặc `updateStudent()`, xử lý lỗi mã số trùng và quay về trang phù hợp khi thành công.

## 8. Avatar từ link hoặc thiết bị

`StudentAvatar` nhận prop `uri`:

- Nếu có URI hợp lệ, dùng `<Image source={{ uri }} />`.
- Nếu URI rỗng/lỗi tải ảnh, hiển thị avatar thay thế để giao diện không bị vỡ.

Trong form, `pickImage()` dùng `expo-image-picker`:

1. Xin quyền truy cập thư viện ảnh.
2. Mở trình chọn ảnh.
3. Khi chọn thành công, lưu URI vào state `avatarUri`.
4. URI đó được lưu vào cột `avatar_uri` khi thêm/sửa.

Lưu ý: URI của ảnh chọn từ thiết bị có tính cục bộ. Khi mở dữ liệu ở thiết bị khác, nên dùng **link ảnh công khai** hoặc bổ sung Supabase Storage nếu muốn avatar đồng bộ hoàn toàn giữa nhiều thiết bị.

## 9. Dialog xác nhận sửa/xóa

`src/components/confirm-dialog.tsx` là dialog dùng chung, nhận:

```ts
visible, title, message,
cancelLabel, confirmLabel,
destructive, onCancel, onConfirm
```

Nó dùng `Modal` của React Native thay vì `Alert.alert`. Đây là phần sửa lỗi quan trọng vì `Alert.alert` không hiển thị hộp xác nhận ổn định khi app chạy trên web. `ConfirmDialog` hoạt động nhất quán trên Android, iOS và web.

- Sửa: `form.tsx` chỉ gọi `save()` ở callback `onConfirm`.
- Xóa ở danh sách: `index.tsx` lưu sinh viên cần xóa vào `studentToDelete`; callback xác nhận mới gọi `deleteStudent(id)`.
- Xóa ở trang chi tiết: `[id].tsx` dùng state `deleteConfirmationOpen`; callback xác nhận mới gọi `deleteStudent(id)`.

## 10. Đa ngôn ngữ

`src/lib/i18n.ts` có hai bộ chuỗi: `vi` và `en`.

```ts
const [locale] = useLocales();
return locale.languageCode === "vi" ? vi : en;
```

Mỗi màn hình gọi `const t = useTranslation()` rồi dùng các khóa như `t.addStudent`, `t.confirmDeleteMessage`, `t.databaseError`. Vì vậy khi ngôn ngữ thiết bị là tiếng Việt, app hiển thị tiếng Việt; ngôn ngữ khác sử dụng tiếng Anh. Tên ứng dụng cấu hình là **Lesson4** trong `app.json`.

## 11. Điều hướng và giao diện

`src/app/_layout.tsx` khai báo `Stack` của Expo Router và ẩn header mặc định để từng màn hình tự thiết kế thanh đầu trang.

Các tuyến đường:

```text
/                    → danh sách
/student/[id]        → chi tiết
/student/form        → thêm mới
/student/form?id=12  → sửa sinh viên ID 12
```

Các `Pressable` có `accessibilityRole` hoặc `accessibilityLabel` tại các điểm tương tác chính, giúp thao tác rõ ràng hơn với trình đọc màn hình và hỗ trợ kiểm thử UI.


```

## 13. Checklist kiểm thử chức năng

- [ ] Mở app khi chưa có dữ liệu: thấy trạng thái danh sách rỗng.
- [ ] Thêm sinh viên với họ tên, mã số, email hợp lệ.
- [ ] Thử bỏ trống trường bắt buộc hoặc nhập email sai: thấy thông báo validation.
- [ ] Thử dùng mã số đã tồn tại trong cùng thiết bị: không lưu được.
- [ ] Chọn avatar bằng link và bằng thư viện ảnh.
- [ ] Chạm một thẻ sinh viên: mở đúng thông tin chi tiết.
- [ ] Sửa dữ liệu: dialog xác nhận xuất hiện; chọn Không thì không đổi, chọn Có thì dữ liệu cập nhật.
- [ ] Xóa từ danh sách và từ trang chi tiết: dialog xác nhận xuất hiện; chọn Không thì giữ nguyên, chọn Có thì bản ghi biến mất.
- [ ] Đổi language của thiết bị sang Việt/Anh: nội dung app đổi ngôn ngữ tương ứng.
- [ ] Tắt hoặc điền sai Supabase config: app hiển thị trạng thái lỗi thay vì bị treo.

## 14. Kết quả đã xác minh

Đã kiểm tra biên dịch TypeScript và Expo lint thành công. Luồng Supabase create → read → update → delete đã được gọi thử. Riêng lỗi xóa trên giao diện web đã được tái hiện và sửa bằng `ConfirmDialog`: bấm nút xóa mở hộp xác nhận, bấm **Có/Yes** xóa bản ghi và danh sách tự cập nhật về trạng thái rỗng.
