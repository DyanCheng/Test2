import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={[styles.box, styles.box1]}>
            <Text style={styles.whiteText}>1</Text>
          </View>

          <View style={[styles.box, styles.box2]}>
            <Text style={styles.whiteText}>2</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.box, styles.box3]}>
            <Text style={styles.blackText}>3</Text>
          </View>

          <View style={[styles.box, styles.box4]}>
            <Text style={styles.whiteText}>4</Text>
          </View>

          <View style={[styles.box, styles.box5]}>
            <Text style={styles.whiteText}>5</Text>
          </View>
        </View>

        <View style={[styles.box, styles.box6]}>
          <Text style={styles.whiteText}>6</Text>
        </View>
      </View>


      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Nguyễn Duy Anh - BIT240020
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  box: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },


  box1: {
    flex: 1,
    height: 180,
    backgroundColor: '#1683F8',
  },


  box2: {
    flex: 1,
    height: 180,
    backgroundColor: '#F52F2F',
  },


  box3: {
    flex: 1,
    height: 175,
    backgroundColor: '#FFD51A',
  },


  box4: {
    flex: 1,
    height: 175,
    backgroundColor: '#20B767',
  },


  box5: {
    flex: 2,
    height: 175,
    backgroundColor: '#8534E8',
  },


  box6: {
    width: '100%',
    height: 150,
    backgroundColor: '#FF790D',
  },

  whiteText: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
  },

  blackText: {
    color: '#000000',
    fontSize: 64,
    fontWeight: 'bold',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 70,
  },

  footerText: {
    color: '#333333',
    fontSize: 22,
    fontWeight: '600',
  },
});