import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CourseImage } from "@/components/course-image";
import {
  createCourse,
  getCategories,
  getCourse,
  updateCourse,
} from "@/lib/mockapi";
import type { Category, CourseInput } from "@/types/course";

const isWebUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());

export default function CourseFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const editing = Boolean(id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const nextCategories = await getCategories();
      setCategories(nextCategories);
      if (id) {
        const course = await getCourse(id);
        setTitle(course.title);
        setDescription(course.description);
        setCategoryId(course.categoryId);
        setInstructor(course.instructor);
        setPrice(String(course.price));
        setDuration(String(course.duration));
        setThumbnail(course.thumbnail);
        setTrailerUrl(course.trailerUrl);
      }
    } catch {
      setMessage("Không thể tải dữ liệu biểu mẫu từ MockAPI.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const category = categories.find((item) => item.id === categoryId);

  const submit = async () => {
    const nextPrice = Number(price);
    const nextDuration = Number(duration);
    if (
      !title.trim() ||
      !description.trim() ||
      !categoryId ||
      !instructor.trim() ||
      !price.trim() ||
      !duration.trim() ||
      !thumbnail.trim() ||
      !trailerUrl.trim()
    )
      return setMessage("Vui lòng nhập đầy đủ tất cả trường.");
    if (!categories.some((item) => item.id === categoryId))
      return setMessage("Danh mục được chọn không tồn tại.");
    if (
      !Number.isFinite(nextPrice) ||
      nextPrice < 0 ||
      !Number.isFinite(nextDuration) ||
      nextDuration <= 0
    )
      return setMessage("Học phí phải không âm và thời lượng phải lớn hơn 0.");
    if (!isWebUrl(thumbnail) || !isWebUrl(trailerUrl))
      return setMessage(
        "URL ảnh bìa và trailer phải bắt đầu bằng http:// hoặc https://.",
      );
    const input: CourseInput = {
      title,
      description,
      categoryId,
      instructor,
      price: nextPrice,
      duration: nextDuration,
      thumbnail,
      trailerUrl,
    };
    setSaving(true);
    setMessage(null);
    try {
      const saved =
        editing && id
          ? await updateCourse(id, input)
          : await createCourse(input);
      router.replace({ pathname: "/course/[id]", params: { id: saved.id } });
    } catch {
      setMessage("Không thể lưu khóa học. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0E8A78" size="large" />
      </View>
    );
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.heading}>
            {editing ? "Sửa khóa học" : "Thêm khóa học"}
          </Text>
          <View style={styles.back} />
        </View>
        <CourseImage uri={thumbnail} height={164} />
        <View style={styles.card}>
          <Field label="Tên khóa học" value={title} onChangeText={setTitle} />
          <Field
            label="Mô tả"
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.label}>Danh mục</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={styles.selector}
          >
            <Text style={category ? styles.selectorText : styles.placeholder}>
              {category?.name ?? "Chọn danh mục"}
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
          <Field
            label="Giảng viên"
            value={instructor}
            onChangeText={setInstructor}
          />
          <Field
            keyboardType="decimal-pad"
            label="Học phí (VNĐ)"
            value={price}
            onChangeText={setPrice}
          />
          <Field
            keyboardType="decimal-pad"
            label="Thời lượng (giờ)"
            value={duration}
            onChangeText={setDuration}
          />
          <Field
            autoCapitalize="none"
            keyboardType="url"
            label="URL ảnh bìa"
            value={thumbnail}
            onChangeText={setThumbnail}
          />
          <Field
            autoCapitalize="none"
            keyboardType="url"
            label="URL trailer MP4"
            value={trailerUrl}
            onChangeText={setTrailerUrl}
          />
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable
          disabled={saving}
          onPress={() => void submit()}
          style={[styles.save, saving && styles.disabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>
              {editing ? "Cập nhật khóa học" : "Thêm khóa học"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
      <Modal
        transparent
        visible={pickerOpen}
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable onPress={() => setPickerOpen(false)} style={styles.overlay}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            {categories.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  setCategoryId(item.id);
                  setPickerOpen(false);
                }}
                style={styles.option}
              >
                <Text style={styles.optionName}>{item.name}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
function Field({
  label,
  multiline,
  ...props
}: { label: string; multiline?: boolean } & React.ComponentProps<
  typeof TextInput
>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholder={label}
        placeholderTextColor="#9AA6B4"
        style={[styles.input, multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FA" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingTop: 58, paddingBottom: 38 },
  top: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 36, color: "#15324A", marginTop: -4 },
  heading: { color: "#15324A", fontSize: 17, fontWeight: "800" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    marginTop: 18,
    padding: 17,
  },
  field: { marginBottom: 15 },
  label: { color: "#586B7D", fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DEE7EA",
    borderRadius: 12,
    color: "#15324A",
    fontSize: 15,
    paddingHorizontal: 12,
    backgroundColor: "#FCFDFD",
  },
  multiline: { minHeight: 82, paddingTop: 11, textAlignVertical: "top" },
  selector: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DEE7EA",
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectorText: { color: "#15324A", fontSize: 15 },
  placeholder: { color: "#9AA6B4", fontSize: 15 },
  chevron: { color: "#0E8A78", fontSize: 20 },
  save: {
    height: 55,
    borderRadius: 17,
    backgroundColor: "#0E8A78",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  disabled: { opacity: 0.65 },
  message: {
    color: "#C84F44",
    textAlign: "center",
    marginTop: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 31, 45, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    maxHeight: "72%",
  },
  modalTitle: {
    color: "#15324A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 9,
  },
  option: {
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E4E9ED",
  },
  optionName: { color: "#15324A", fontWeight: "800", fontSize: 15 },
  optionDescription: { color: "#718293", fontSize: 13, marginTop: 4 },
});
