import { StyleSheet, Text, View } from "react-native";

const App = () => {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={[styles.block, styles.blue]}>
          <Text style={styles.lightLabel}>1</Text>
        </View>
        <View style={[styles.block, styles.red]}>
          <Text style={styles.lightLabel}>2</Text>
        </View>

        <View style={styles.middleRow}>
          <View style={[styles.middleBlock, styles.yellow]}>
            <Text style={styles.darkLabel}>3</Text>
          </View>
          <View style={[styles.middleBlock, styles.green]}>
            <Text style={styles.lightLabel}>4</Text>
          </View>
          <View style={[styles.middleBlock, styles.purple]}>
            <Text style={styles.lightLabel}>5</Text>
          </View>
        </View>

        <View style={[styles.block, styles.orange, styles.bottomBlock]}>
          <Text style={styles.lightLabel}>6</Text>
        </View>
      </View>

      <Text style={styles.studentLabel}>Nguyễn Duy Anh - Bit240020</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingLeft: 26,
    paddingTop: 14,
  },
  content: {
    width: 480,
    gap: 7,
  },
  block: {
    height: 93,
    alignItems: "center",
    justifyContent: "center",
  },
  middleRow: {
    flexDirection: "row",
    width: 364,
    gap: 8,
  },
  middleBlock: {
    flex: 1,
    height: 192,
    alignItems: "center",
    justifyContent: "center",
  },
  lightLabel: {
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "700",
  },
  darkLabel: {
    color: "#000000",
    fontSize: 40,
    fontWeight: "700",
  },
  blue: {
    backgroundColor: "#2f80ed",
  },
  red: {
    backgroundColor: "#ff3b3f",
  },
  yellow: {
    backgroundColor: "#ffd21c",
  },
  green: {
    backgroundColor: "#2eb16b",
  },
  purple: {
    backgroundColor: "#7d3ddd",
  },
  orange: {
    backgroundColor: "#ff7414",
  },
  bottomBlock: {
    height: 160,
  },
  studentLabel: {
    position: "absolute",
    width: 480,
    bottom: 8,
    left: 26,
    color: "#1f2937",
    fontSize: 18,
    textAlign: "center",
  },
});

export default App;
