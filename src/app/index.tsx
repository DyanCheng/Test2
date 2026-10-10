import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { StudentAvatar } from "@/components/student-avatar";
import { useTranslation } from "@/lib/i18n";
import { deleteStudent, getStudents } from "@/lib/student-database";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Student } from "@/types/student";

export default function StudentListScreen() {
  const t = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const loadStudents = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      if (!isSupabaseConfigured) {
        setStudents([]);
        setLoadError(t.supabaseNotConfigured);
        return;
      }
      setStudents(await getStudents());
      setLoadError(null);
    } catch {
      setStudents([]);
      setLoadError(t.databaseError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadStudents();
    }, [loadStudents]),
  );

  const removeSelectedStudent = async () => {
    const student = studentToDelete;
    setStudentToDelete(null);
    if (!student) return;
    try {
      await deleteStudent(student.id);
      await loadStudents();
    } catch {
      Alert.alert(t.appName, t.deleteError);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>LESSON 4</Text>
        <Text style={styles.title}>{t.appName}</Text>
        <Text style={styles.subtitle}>{t.studentList}</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#315BD6" />
          <Text style={styles.loadingLabel}>{t.loading}</Text>
        </View>
      ) : loadError ? (
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>☁</Text>
          <Text style={styles.errorTitle}>{loadError}</Text>
          <Text style={styles.errorHint}>{isSupabaseConfigured ? t.databaseError : t.supabaseSetupHint}</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(student) => String(student.id)}
          contentContainerStyle={students.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadStudents(true)} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.fullName}
                onPress={() => router.push({ pathname: "/student/[id]", params: { id: String(item.id) } })}
                style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}>
                <StudentAvatar uri={item.avatarUri} />
                <View style={styles.studentText}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.fullName}
                  </Text>
                  <Text style={styles.code}>{item.studentCode}</Text>
                  <Text numberOfLines={1} style={styles.email}>
                    {item.email}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel={`${t.delete} ${item.fullName}`}
                hitSlop={12}
                onPress={() => setStudentToDelete(item)}
                style={({ pressed }) => [styles.deleteIcon, pressed && styles.pressed]}>
                <Text style={styles.deleteIconText}>×</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎓</Text>
              <Text style={styles.emptyTitle}>{t.noStudents}</Text>
              <Text style={styles.emptyHint}>{t.noStudentsHint}</Text>
            </View>
          }
        />
      )}

      <Pressable
        accessibilityRole="button"
        disabled={Boolean(loadError)}
        onPress={() => router.push("/student/form")}
        style={({ pressed }) => [styles.addButton, (pressed || Boolean(loadError)) && styles.pressed]}>
        <Text style={styles.addButtonText}>＋ {t.addStudent}</Text>
      </Pressable>

      <ConfirmDialog
        cancelLabel={t.cancel}
        confirmLabel={t.yes}
        destructive
        message={t.confirmDeleteMessage}
        onCancel={() => setStudentToDelete(null)}
        onConfirm={() => void removeSelectedStudent()}
        title={t.confirmDeleteTitle}
        visible={Boolean(studentToDelete)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    paddingTop: 62,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: "#315BD6",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: "#16213E",
    fontSize: 29,
    fontWeight: "800",
    marginTop: 5,
  },
  subtitle: {
    color: "#77839A",
    fontSize: 15,
    marginTop: 5,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingLabel: {
    color: "#77839A",
    fontSize: 15,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 96,
  },
  errorIcon: {
    color: "#315BD6",
    fontSize: 44,
    marginBottom: 10,
  },
  errorTitle: {
    color: "#16213E",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  errorHint: {
    color: "#77839A",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  list: {
    paddingBottom: 108,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 110,
  },
  card: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    shadowColor: "#213047",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  studentText: {
    flex: 1,
    marginLeft: 13,
  },
  name: {
    color: "#16213E",
    fontSize: 16,
    fontWeight: "800",
  },
  code: {
    color: "#315BD6",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  email: {
    color: "#77839A",
    fontSize: 13,
    marginTop: 4,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF1F1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteIconText: {
    color: "#DE4B4B",
    fontSize: 26,
    fontWeight: "500",
    lineHeight: 28,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 34,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#16213E",
    fontSize: 19,
    fontWeight: "800",
  },
  emptyHint: {
    color: "#77839A",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 26,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#315BD6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#315BD6",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.7,
  },
});
