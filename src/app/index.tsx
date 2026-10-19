import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CourseImage } from "@/components/course-image";
import { getCategories, getCourses } from "@/lib/mockapi";
import type { Category, Course } from "@/types/course";

export default function CourseListScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [nextCourses, nextCategories] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(nextCourses);
      setCategories(nextCategories);
      setError(null);
    } catch {
      setError(
        "Không thể tải dữ liệu từ MockAPI. Kiểm tra kết nối mạng rồi thử lại.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const categoryName = useCallback(
    (id: string) =>
      categories.find((category) => category.id === id)?.name ??
      "Chưa có danh mục",
    [categories],
  );
  const filteredCourses = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi");
    return courses.filter(
      (course) =>
        (!selectedCategoryId || course.categoryId === selectedCategoryId) &&
        (!keyword || course.title.toLocaleLowerCase("vi").includes(keyword)),
    );
  }, [courses, query, selectedCategoryId]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LESSON 5</Text>
        <Text style={styles.title}>Quản lý khóa học</Text>
        <Text style={styles.subtitle}>
          Khám phá, quản lý và cập nhật khóa học
        </Text>
      </View>
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Tìm kiếm khóa học"
          onChangeText={setQuery}
          placeholder="Tìm kiếm theo tên khóa học"
          placeholderTextColor="#8B98AA"
          style={styles.searchInput}
          value={query}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.filters}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <FilterChip
          active={!selectedCategoryId}
          label="Tất cả"
          onPress={() => setSelectedCategoryId(null)}
        />
        {categories.map((category) => (
          <FilterChip
            active={selectedCategoryId === category.id}
            key={category.id}
            label={category.name}
            onPress={() => setSelectedCategoryId(category.id)}
          />
        ))}
      </ScrollView>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0E8A78" size="large" />
          <Text style={styles.muted}>Đang tải khóa học...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={
            filteredCourses.length ? styles.list : styles.emptyList
          }
          data={filteredCourses}
          keyExtractor={(course) => course.id}
          refreshControl={
            <RefreshControl
              onRefresh={() => void load(true)}
              refreshing={refreshing}
              tintColor="#0E8A78"
            />
          }
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              categoryName={categoryName(item.categoryId)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
              <Text style={styles.muted}>
                Hãy đổi từ khóa hoặc danh mục lọc.
              </Text>
            </View>
          }
        />
      )}
      <View style={styles.bottomActions}>
        <Pressable
          onPress={() => router.push("/categories")}
          style={styles.categoriesButton}
        >
          <Text style={styles.categoriesText}>☷ Danh mục</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/course/form")}
          style={styles.addButton}
        >
          <Text style={styles.addText}>＋ Thêm khóa học</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CourseCard({
  course,
  categoryName,
}: {
  course: Course;
  categoryName: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: "/course/[id]", params: { id: course.id } })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <CourseImage uri={course.thumbnail} height={138} />
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {course.title}
        </Text>
        <Text style={styles.instructor}>Giảng viên: {course.instructor}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.price}>
            {course.price.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8FA",
    paddingTop: 58,
    paddingHorizontal: 20,
  },
  header: { marginBottom: 18 },
  eyebrow: {
    color: "#0E8A78",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1.4,
  },
  title: { color: "#15324A", fontSize: 29, fontWeight: "800", marginTop: 4 },
  subtitle: { color: "#6D7D8E", fontSize: 14, marginTop: 5 },
  searchRow: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    shadowColor: "#20384A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: { color: "#0E8A78", fontSize: 26, marginRight: 8 },
  searchInput: { flex: 1, color: "#15324A", fontSize: 15 },
  filters: { gap: 9, paddingVertical: 15, paddingRight: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#D7E1E7",
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
  },
  chipActive: { borderColor: "#0E8A78", backgroundColor: "#0E8A78" },
  chipText: { color: "#5E7182", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#FFFFFF" },
  list: { gap: 14, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    overflow: "hidden",
    shadowColor: "#20384A",
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardBody: { padding: 15 },
  cardTitle: {
    color: "#15324A",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  instructor: { color: "#6D7D8E", fontSize: 13, marginTop: 7 },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
  category: {
    color: "#0E8A78",
    backgroundColor: "#E4F5F1",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  price: { color: "#EA6C35", fontSize: 14, fontWeight: "800" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingBottom: 90,
    paddingHorizontal: 28,
  },
  muted: {
    color: "#6D7D8E",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  error: {
    color: "#C84F44",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
  retry: {
    borderRadius: 13,
    backgroundColor: "#0E8A78",
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  emptyList: { flexGrow: 1, justifyContent: "center", paddingBottom: 100 },
  empty: { alignItems: "center", gap: 9 },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: "#15324A", fontSize: 18, fontWeight: "800" },
  bottomActions: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    gap: 10,
    flexDirection: "row",
  },
  categoriesButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#E2EEE9",
    paddingHorizontal: 15,
  },
  categoriesText: { color: "#176B5D", fontSize: 14, fontWeight: "800" },
  addButton: {
    flex: 1,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E8A78",
    shadowColor: "#0E8A78",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  addText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
