import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

export function TrailerPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return (
    <View style={styles.frame}>
      <VideoView
        fullscreenOptions={{ enable: true }}
        nativeControls
        player={player}
        style={styles.video}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#101828",
  },
  video: { width: "100%", height: "100%" },
});
