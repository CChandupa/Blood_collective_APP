import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Slot } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { Colors } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Header />
          <View style={styles.content}>
            <Slot />
          </View>
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    // Add paddingTop for Android to avoid overlapping with status bar
    paddingTop: Platform.OS === 'android' ? 24 : 0, 
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  }
});
