import React from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const colors = {
  primary: "#2563eb",
  danger: "#dc2626",
  border: "#d1d5db",
  muted: "#6b7280",
  background: "#f8fafc",
};
export function Button({
  title,
  onPress,
  type = "primary",
}: {
  title: string;
  onPress: () => void;
  type?: "primary" | "danger" | "neutral";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        type === "danger" && styles.danger,
        type === "neutral" && styles.neutral,
      ]}
    >
      <Text
        style={[styles.buttonText, type === "neutral" && styles.neutralText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  error,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && styles.textarea,
          error ? styles.errorInput : undefined,
        ]}
        placeholderTextColor="#9ca3af"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.sub, { marginTop: 8 }]}>{message}</Text>
          <View style={styles.dialogButtons}>
            <View style={styles.dialogButton}>
              <Button title={cancelLabel} type="neutral" onPress={onCancel} />
            </View>
            <View style={styles.dialogButton}>
              <Button title={confirmLabel} type="danger" onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, padding: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sub: { color: colors.muted, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  spread: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  danger: { backgroundColor: colors.danger },
  neutral: { backgroundColor: "#e5e7eb" },
  buttonText: { color: "white", fontWeight: "700" },
  neutralText: { color: "#111827" },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 11,
    backgroundColor: "white",
    color: "#111827",
  },
  textarea: { minHeight: 84, textAlignVertical: "top" },
  errorInput: { borderColor: colors.danger },
  error: { color: colors.danger, marginTop: 4 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: { backgroundColor: "white", borderRadius: 12, padding: 18 },
  dialogButtons: { flexDirection: "row", gap: 10, marginTop: 14 },
  dialogButton: { flex: 1 },
});
