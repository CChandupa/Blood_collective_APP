import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useResponsive } from '../hooks/useResponsive';
import { LogOut, User as UserIcon, Droplet } from 'lucide-react-native';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isMobile, fs, responsive } = useResponsive();

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
    <View style={[
      styles.container, 
      { 
        paddingHorizontal: responsive(12, 20, 32),
        paddingVertical: responsive(10, 14, 16),
      }
    ]}>
      <TouchableOpacity 
        style={styles.logoContainer} 
        onPress={() => router.push('/')}
      >
        <View style={styles.iconContainer}>
          <Droplet color={Colors.primary} size={responsive(18, 22, 24)} fill={Colors.primary} />
        </View>
        <Text style={[styles.logoText, { fontSize: fs(isMobile ? 16 : 20) }]}>
          Blood Collective
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        {user ? (
          <>
            <TouchableOpacity style={[styles.iconButton, { padding: responsive(6, 8, 8) }]} onPress={goToDashboard}>
              <UserIcon color={Colors.text} size={responsive(16, 18, 20)} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { padding: responsive(6, 8, 8) }]} onPress={handleLogout}>
              <LogOut color={Colors.danger} size={responsive(16, 18, 20)} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.loginButton, {
              paddingHorizontal: responsive(12, 16, 16),
              paddingVertical: responsive(6, 8, 8),
            }]} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.loginText, { fontSize: fs(isMobile ? 13 : 14) }]}>Login</Text>
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
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFF',
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
});
