import { Image, StyleSheet, Text, View } from "react-native";

type StudentAvatarProps = {
  uri?: string | null;
  size?: number;
};

export function StudentAvatar({ uri, size = 64 }: StudentAvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.placeholder, { fontSize: size * 0.42 }]}>👤</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#E7EDF8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholder: {
    color: "#7082A2",
  },
});
