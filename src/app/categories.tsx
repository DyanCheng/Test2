import { router, useFocusEffect } from "expo-router";
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

import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCourses,
  updateCategory,
} from "@/lib/mockapi";
import type { Category, CategoryInput, Course } from "@/types/course";

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextCategories, nextCourses] = await Promise.all([
        getCategories(),
        getCourses(),
      ]);
      setCategories(nextCategories);
      setCourses(nextCourses);
      setMessage(null);
    } catch {
      setMessage("Không thể tải danh mục từ MockAPI.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const openForm = (category?: Category) => {
    setEditing(category ?? null);
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setFormOpen(true);
  };
  const save = async () => {
    if (!name.trim() || !description.trim())
      return setMessage("Vui lòng nhập tên và mô tả danh mục.");
    setSaving(true);
    try {
      const input: CategoryInput = {
        name: name.trim(),
        description: description.trim(),
      };
      if (editing) await updateCategory(editing.id, input);
      else await createCategory(input);
      setFormOpen(false);
      await load();
    } catch {
      setMessage("Không thể lưu danh mục.");
    } finally {
      setSaving(false);
    }
  };
  const requestDelete = (category: Category) => {
    if (courses.some((course) => course.categoryId === category.id))
      return setMessage(
        "Không thể xóa danh mục đang có khóa học. Hãy chuyển hoặc xóa các khóa học trước.",
      );
    setDeleteTarget(category);
  };
  const remove = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteCategory(target.id);
      await load();
    } catch {
      setMessage("Không thể xóa danh mục.");
    }
  };
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Quản lý danh mục</Text>
        <Pressable onPress={() => openForm()} style={styles.add}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0E8A78" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {categories.map((category) => (
            <View key={category.id} style={styles.item}>
              <View style={styles.itemMain}>
                <Text style={styles.name}>{category.name}</Text>
                <Text style={styles.description}>{category.description}</Text>
                <Text style={styles.count}>
                  {
                    courses.filter(
                      (course) => course.categoryId === category.id,
                    ).length
                  }{" "}
                  khóa học
                </Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable
                  onPress={() => openForm(category)}
                  style={styles.edit}
                >
                  <Text style={styles.editText}>Sửa</Text>
                </Pressable>
                <Pressable
                  onPress={() => requestDelete(category)}
                  style={styles.remove}
                >
                  <Text style={styles.removeText}>Xóa</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <Modal
        transparent
        visible={formOpen}
        animationType="fade"
        onRequestClose={() => setFormOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </Text>
            <TextInput
              onChangeText={setName}
              placeholder="Tên danh mục"
              placeholderTextColor="#9AA6B4"
              style={styles.input}
              value={name}
            />
            <TextInput
              multiline
              onChangeText={setDescription}
              placeholder="Mô tả danh mục"
              placeholderTextColor="#9AA6B4"
              style={[styles.input, styles.multi]}
              value={description}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setFormOpen(false)}
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={saving}
                onPress={() => void save()}
                style={styles.save}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Lưu</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmDialog
        cancelLabel="Không"
        confirmLabel="Có"
        destructive
        message="Bạn có muốn xóa danh mục này không?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
        title="Xác nhận xóa"
        visible={Boolean(deleteTarget)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FA", padding: 20, paddingTop: 58 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#15324A", fontSize: 36, marginTop: -4 },
  title: { color: "#15324A", fontSize: 17, fontWeight: "800" },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0E8A78",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#FFFFFF", fontSize: 24, fontWeight: "500" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { gap: 12, paddingBottom: 28 },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemMain: { flex: 1 },
  name: { color: "#15324A", fontWeight: "800", fontSize: 16 },
  description: { color: "#6D7D8E", fontSize: 13, lineHeight: 19, marginTop: 5 },
  count: { color: "#0E8A78", fontWeight: "700", fontSize: 12, marginTop: 9 },
  itemActions: { gap: 8 },
  edit: {
    borderRadius: 9,
    backgroundColor: "#E4F5F1",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  editText: { color: "#0A7968", fontSize: 12, fontWeight: "800" },
  remove: {
    borderRadius: 9,
    backgroundColor: "#FFF0EF",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  removeText: { color: "#C84F44", fontSize: 12, fontWeight: "800" },
  message: {
    color: "#C84F44",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(15,31,45,.45)",
    padding: 24,
  },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20 },
  modalTitle: {
    color: "#15324A",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 16,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDE6E9",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#15324A",
    marginBottom: 12,
  },
  multi: { minHeight: 82, paddingTop: 11, textAlignVertical: "top" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  cancel: {
    borderRadius: 12,
    backgroundColor: "#EDF1F2",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  cancelText: { color: "#526677", fontWeight: "800" },
  save: {
    minWidth: 82,
    borderRadius: 12,
    backgroundColor: "#0E8A78",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  saveText: { color: "#FFFFFF", fontWeight: "800" },
});
