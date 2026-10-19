import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export function CourseImage({
  uri,
  height = 148,
}: {
  uri: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed)
    return (
      <View style={[styles.fallback, { height }]}>
        <Text style={styles.fallbackIcon}>▶</Text>
        <Text style={styles.fallbackText}>KHÓA HỌC</Text>
      </View>
    );
  return (
    <Image
      accessibilityLabel="Ảnh bìa khóa học"
      onError={() => setFailed(true)}
      source={{ uri }}
      style={[styles.image, { height }]}
    />
  );
}
const styles = StyleSheet.create({
  image: { width: "100%", backgroundColor: "#E8EEF7" },
  fallback: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#183153",
  },
  fallbackIcon: { color: "#70C0B3", fontSize: 29, marginBottom: 5 },
  fallbackText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
});
