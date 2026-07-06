import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, Droplet } from 'lucide-react-native';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const goToDashboard = () => {
    if (user?.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/donor');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.logoContainer} 
        onPress={() => router.push('/')}
      >
        <View style={styles.iconContainer}>
          <Droplet color={Colors.primary} size={24} fill={Colors.primary} />
        </View>
        <Text style={styles.logoText}>Blood Collective</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        {user ? (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={goToDashboard}>
              <UserIcon color={Colors.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <LogOut color={Colors.danger} size={20} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  logoText: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFF',
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
});
