import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { StudentAvatar } from "@/components/student-avatar";
import { useTranslation } from "@/lib/i18n";
import { deleteStudent, getStudent } from "@/lib/student-database";
import type { Student } from "@/types/student";

export default function StudentDetailScreen() {
  const t = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const studentId = Number(id);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const loadStudent = useCallback(async () => {
    if (!Number.isInteger(studentId) || studentId <= 0) {
      setStudent(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setStudent(await getStudent(studentId));
      setLoadError(null);
    } catch {
      setStudent(null);
      setLoadError(t.databaseError);
    } finally {
      setLoading(false);
    }
  }, [studentId, t.databaseError]);

  useFocusEffect(
    useCallback(() => {
      void loadStudent();
    }, [loadStudent]),
  );

  const removeStudent = async () => {
    if (!student) return;
    setDeleteConfirmationOpen(false);
    try {
      await deleteStudent(student.id);
      router.replace("/");
    } catch {
      Alert.alert(t.appName, t.deleteError);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#315BD6" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missingTitle}>{loadError ?? t.notFound}</Text>
        <Pressable onPress={() => router.replace("/")} style={styles.primaryButton}>
          <Text style={styles.primaryText}>{t.back}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>{t.studentInformation}</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.profileCard}>
          <StudentAvatar uri={student.avatarUri} size={112} />
          <Text style={styles.name}>{student.fullName}</Text>
          <Text style={styles.code}>{student.studentCode}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label={t.fullName} value={student.fullName} />
          <View style={styles.divider} />
          <InfoRow label={t.studentCode} value={student.studentCode} />
          <View style={styles.divider} />
          <InfoRow label={t.email} value={student.email} />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={() => setDeleteConfirmationOpen(true)} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
          <Text style={styles.deleteText}>{t.delete}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: "/student/form", params: { id: String(student.id) } })}
          style={({ pressed }) => [styles.primaryButton, styles.editButton, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>✎  {t.editStudent}</Text>
        </Pressable>
      </View>
      <ConfirmDialog
        cancelLabel={t.cancel}
        confirmLabel={t.yes}
        destructive
        message={t.confirmDeleteMessage}
        onCancel={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => void removeStudent()}
        title={t.confirmDeleteTitle}
        visible={deleteConfirmationOpen}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FC" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15, padding: 24 },
  loadingText: { color: "#77839A", fontSize: 15 },
  missingTitle: { color: "#16213E", fontSize: 19, fontWeight: "700", marginBottom: 8 },
  content: { paddingTop: 58, paddingHorizontal: 20, paddingBottom: 128 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#16213E", fontSize: 36, fontWeight: "300", lineHeight: 36, marginTop: -4 },
  topTitle: { color: "#16213E", fontSize: 17, fontWeight: "800" },
  profileCard: { alignItems: "center", marginBottom: 24 },
  name: { color: "#16213E", fontSize: 24, fontWeight: "800", marginTop: 14, textAlign: "center" },
  code: { color: "#315BD6", fontSize: 14, fontWeight: "700", marginTop: 5 },
  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 18, shadowColor: "#213047", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  infoRow: { paddingVertical: 18 },
  infoLabel: { color: "#77839A", fontSize: 13, marginBottom: 6 },
  infoValue: { color: "#16213E", fontSize: 16, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E7EAF0" },
  actions: { position: "absolute", left: 20, right: 20, bottom: 26, flexDirection: "row", gap: 12 },
  primaryButton: { height: 54, borderRadius: 17, backgroundColor: "#315BD6", alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },
  editButton: { flex: 1 },
  primaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  deleteButton: { height: 54, minWidth: 86, borderRadius: 17, backgroundColor: "#FFF0F0", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  deleteText: { color: "#D64949", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
