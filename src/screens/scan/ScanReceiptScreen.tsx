import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ScanReceiptScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Scanner</Text>
      <Text style={styles.sub}>Coming in next step</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title:     { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  sub:       { fontSize: 14, color: '#888', marginBottom: 32 },
  btn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});