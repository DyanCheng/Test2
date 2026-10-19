import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** A platform-consistent confirmation modal for Android, iOS, and web. */
export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel={cancelLabel} onPress={onCancel} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [styles.confirmButton, destructive && styles.destructiveButton, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 29, 53, 0.45)",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#16213E",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  title: { color: "#16213E", fontSize: 19, fontWeight: "800" },
  message: { color: "#59677E", fontSize: 15, lineHeight: 22, marginTop: 10 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 24 },
  cancelButton: { borderRadius: 13, backgroundColor: "#EEF1F6", minWidth: 82, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  confirmButton: { borderRadius: 13, backgroundColor: "#315BD6", minWidth: 82, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  destructiveButton: { backgroundColor: "#D64949" },
  cancelText: { color: "#43516A", fontSize: 14, fontWeight: "800" },
  confirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
