import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Import shared types to verify the workspace setup
import type { Order, AuthUser } from '@yummyfi/types';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>🍽️ Yummyfi Order Tracker</Text>
        <Text style={styles.subtitle}>Mobile Order Tracking</Text>
        <Text style={styles.status}>Setup complete! Ready for implementation.</Text>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#00aa00',
    textAlign: 'center',
    marginTop: 20,
  },
});