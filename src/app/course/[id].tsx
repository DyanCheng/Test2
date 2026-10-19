import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { CourseImage } from "@/components/course-image";
import { TrailerPlayer } from "@/components/trailer-player";
import { deleteCourse, getCategories, getCourse } from "@/lib/mockapi";
import type { Course } from "@/types/course";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [categoryName, setCategoryName] = useState("Đang tải...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [nextCourse, categories] = await Promise.all([getCourse(id), getCategories()]);
      setCourse(nextCourse);
      setCategoryName(categories.find((category) => category.id === nextCourse.categoryId)?.name ?? "Danh mục không tồn tại");
      setError(null);
    } catch { setError("Không thể tải chi tiết khóa học."); } finally { setLoading(false); }
  }, [id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const remove = async () => { if (!course) return; setDeleteOpen(false); try { await deleteCourse(course.id); router.replace("/"); } catch { setError("Không thể xóa khóa học. Vui lòng thử lại."); } };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#0E8A78" size="large" /><Text style={styles.muted}>Đang tải...</Text></View>;
  if (!course) return <View style={styles.center}><Text style={styles.error}>{error ?? "Không tìm thấy khóa học."}</Text><Pressable onPress={() => router.replace("/")} style={styles.primary}><Text style={styles.primaryText}>Về danh sách</Text></Pressable></View>;
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}><Pressable accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.roundButton}><Text style={styles.backIcon}>‹</Text></Pressable><Text style={styles.topTitle}>Chi tiết khóa học</Text><View style={styles.roundButton} /></View>
      <CourseImage uri={course.thumbnail} height={210} />
      <View style={styles.heading}><Text style={styles.category}>{categoryName}</Text><Text style={styles.title}>{course.title}</Text><Text style={styles.instructor}>Giảng viên: {course.instructor}</Text></View>
      <View style={styles.infoCard}><Info label="Mô tả" value={course.description} /><Divider /><View style={styles.twoColumns}><Info label="Học phí" value={`${course.price.toLocaleString("vi-VN")} đ`} /><Info label="Thời lượng" value={`${course.duration} giờ`} /></View><Divider /><Info label="Ngày tạo" value={course.createdAt ? new Date(course.createdAt).toLocaleDateString("vi-VN") : "-"} /></View>
      {showTrailer ? <View style={styles.trailerArea}><Text style={styles.sectionTitle}>Trailer khóa học</Text><TrailerPlayer uri={course.trailerUrl} /></View> : <Pressable disabled={!course.trailerUrl} onPress={() => setShowTrailer(true)} style={[styles.trailerButton, !course.trailerUrl && styles.disabled]}><Text style={styles.trailerText}>▶  Xem trailer</Text></Pressable>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
    <View style={styles.actions}><Pressable onPress={() => setDeleteOpen(true)} style={styles.deleteButton}><Text style={styles.deleteText}>Xóa</Text></Pressable><Pressable onPress={() => router.push({ pathname: "/course/form", params: { id: course.id } })} style={[styles.primary, styles.editButton]}><Text style={styles.primaryText}>✎ Sửa khóa học</Text></Pressable></View>
    <ConfirmDialog cancelLabel="Không" confirmLabel="Có" destructive message="Bạn có muốn xóa khóa học này không?" onCancel={() => setDeleteOpen(false)} onConfirm={() => void remove()} title="Xác nhận xóa" visible={deleteOpen} />
  </View>;
}
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || "-"}</Text></View>; }
function Divider() { return <View style={styles.divider} />; }
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FA" }, content: { padding: 20, paddingTop: 58, paddingBottom: 132 }, center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 28 }, topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }, roundButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }, backIcon: { fontSize: 36, lineHeight: 37, color: "#15324A", marginTop: -4 }, topTitle: { color: "#15324A", fontWeight: "800", fontSize: 16 },
  heading: { paddingTop: 18 }, category: { color: "#0E8A78", fontSize: 13, fontWeight: "800" }, title: { color: "#15324A", fontSize: 25, fontWeight: "800", lineHeight: 32, marginTop: 7 }, instructor: { color: "#6D7D8E", fontSize: 14, marginTop: 7 }, infoCard: { marginTop: 22, borderRadius: 19, padding: 17, backgroundColor: "#FFFFFF" }, info: { flex: 1, paddingVertical: 8 }, infoLabel: { color: "#77889A", fontSize: 13, marginBottom: 6 }, infoValue: { color: "#15324A", fontWeight: "700", fontSize: 15, lineHeight: 22 }, divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E4E9ED" }, twoColumns: { flexDirection: "row", gap: 16 }, trailerArea: { marginTop: 23, gap: 10 }, sectionTitle: { color: "#15324A", fontSize: 16, fontWeight: "800" }, trailerButton: { height: 54, borderRadius: 17, marginTop: 23, backgroundColor: "#E1F4EF", alignItems: "center", justifyContent: "center" }, trailerText: { color: "#0A7968", fontSize: 15, fontWeight: "800" }, disabled: { opacity: 0.45 },
  actions: { position: "absolute", left: 20, right: 20, bottom: 24, flexDirection: "row", gap: 10 }, deleteButton: { height: 54, minWidth: 84, borderRadius: 17, backgroundColor: "#FFF0EF", alignItems: "center", justifyContent: "center" }, deleteText: { color: "#C84F44", fontWeight: "800" }, primary: { height: 54, borderRadius: 17, backgroundColor: "#0E8A78", alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }, editButton: { flex: 1 }, primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 }, muted: { color: "#6D7D8E" }, error: { color: "#C84F44", textAlign: "center", fontWeight: "700", lineHeight: 21 },
});
