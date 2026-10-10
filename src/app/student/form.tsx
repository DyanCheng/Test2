import { type ComponentProps, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { StudentAvatar } from "@/components/student-avatar";
import { useTranslation } from "@/lib/i18n";
import {
  createStudent,
  getStudent,
  updateStudent,
} from "@/lib/student-database";
import type { StudentInput } from "@/types/student";

export default function StudentFormScreen() {
  const t = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const studentId = id ? Number(id) : null;
  const editing = Number.isInteger(studentId) && (studentId ?? 0) > 0;
  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [editConfirmationOpen, setEditConfirmationOpen] = useState(false);

  useEffect(() => {
    if (!editing || !studentId) return;
    let active = true;
    void (async () => {
      try {
        const student = await getStudent(studentId);
        if (!active) return;
        if (!student) {
          setLoadError(t.notFound);
          return;
        }
        setFullName(student.fullName);
        setStudentCode(student.studentCode);
        setEmail(student.email);
        setAvatarUri(student.avatarUri ?? "");
        setLoadError(null);
      } catch {
        if (active) setLoadError(t.databaseError);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [editing, studentId, t.databaseError, t.notFound]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormMessage(t.photoPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const input: StudentInput = {
    fullName,
    studentCode,
    email,
    avatarUri: avatarUri || null,
  };

  const validationMessage = () => {
    if (!fullName.trim() || !studentCode.trim() || !email.trim())
      return t.required;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return t.invalidEmail;
    return null;
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing && studentId) {
        await updateStudent(studentId, input);
        router.back();
      } else {
        await createStudent(input);
        router.replace("/");
      }
    } catch (error) {
      const message = String(error).toUpperCase().includes("UNIQUE")
        ? t.duplicateCode
        : t.saveError;
      setFormMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    const message = validationMessage();
    if (message) {
      setFormMessage(message);
      return;
    }
    if (editing) {
      setEditConfirmationOpen(true);
    } else {
      void save();
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#315BD6" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{loadError}</Text>
        <Pressable onPress={() => router.back()} style={styles.errorBackButton}>
          <Text style={styles.errorBackText}>{t.back}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>
            {editing ? t.editStudentTitle : t.addStudentTitle}
          </Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.avatarSection}>
          <StudentAvatar uri={avatarUri} size={104} />
          <Pressable
            onPress={() => void pickImage()}
            style={styles.photoButton}
          >
            <Text style={styles.photoButtonText}>
              {avatarUri ? t.changePhoto : t.choosePhoto}
            </Text>
          </Pressable>
          {avatarUri ? (
            <Pressable onPress={() => setAvatarUri("")}>
              <Text style={styles.removePhoto}>{t.removePhoto}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.formCard}>
          <Field
            label={t.fullName}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Field
            label={t.studentCode}
            value={studentCode}
            onChangeText={setStudentCode}
            autoCapitalize="characters"
          />
          <Field
            label={t.email}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label={t.avatarLink}
            value={avatarUri}
            onChangeText={setAvatarUri}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {formMessage ? (
          <Text style={styles.formMessage}>{formMessage}</Text>
        ) : null}

        <Pressable
          disabled={saving}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            (pressed || saving) && styles.pressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {editing ? t.update : t.addStudent}
            </Text>
          )}
        </Pressable>
      </ScrollView>
      <ConfirmDialog
        cancelLabel={t.cancel}
        confirmLabel={t.yes}
        message={t.confirmEditMessage}
        onCancel={() => setEditConfirmationOpen(false)}
        onConfirm={() => {
          setEditConfirmationOpen(false);
          void save();
        }}
        title={t.confirmEditTitle}
        visible={editConfirmationOpen}
      />
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={label}
        placeholderTextColor="#A7B0C1"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F8FC" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
  loadingText: { color: "#77839A", fontSize: 15 },
  errorText: {
    color: "#16213E",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 28,
  },
  errorBackButton: {
    backgroundColor: "#315BD6",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorBackText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  content: { paddingTop: 58, paddingHorizontal: 20, paddingBottom: 36 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#16213E",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 36,
    marginTop: -4,
  },
  title: {
    color: "#16213E",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  avatarSection: { alignItems: "center", marginVertical: 8 },
  photoButton: {
    marginTop: 11,
    backgroundColor: "#EAF0FF",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 13,
  },
  photoButtonText: { color: "#315BD6", fontSize: 13, fontWeight: "800" },
  removePhoto: {
    color: "#D64949",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    shadowColor: "#213047",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  formMessage: {
    color: "#C33D3D",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center",
  },
  field: { marginBottom: 16 },
  label: { color: "#43516A", fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: "#E2E7F0",
    borderRadius: 13,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#16213E",
    backgroundColor: "#FCFDFF",
  },
  submitButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#315BD6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#315BD6",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
