import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors, Fonts } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { api } from '../../services/api';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { isMobile, responsive, fs } = useResponsive();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'admin'>('donor');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role,
      });

      if (response.data.success) {
        const rawUser = response.data.data.user;
        if (role === 'admin') {
          await login(response.data.data.token, {
            id: rawUser.admin_id,
            email: rawUser.email,
            role: 'admin'
          });
          router.replace('/dashboard/admin');
        } else {
          await login(response.data.data.token, {
            id: rawUser.donor_id,
            email: rawUser.email,
            name: rawUser.full_name,
            role: 'donor'
          });
          router.replace('/dashboard/donor');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.card,
          {
            maxWidth: responsive(360, 400, 420),
            padding: responsive(20, 28, 32),
          }
        ]}>
          <Text style={[styles.title, { fontSize: fs(responsive(22, 26, 28)) }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { fontSize: fs(responsive(14, 15, 16)) }]}>Sign in to your account</Text>
          
          <View style={styles.roleToggle}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'donor' && styles.roleButtonActive]}
              onPress={() => setRole('donor')}
            >
              <Text style={[styles.roleText, role === 'donor' && styles.roleTextActive]}>Donor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

          <Input 
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input 
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Button 
            title="Sign In" 
            onPress={handleLogin} 
            isLoading={isLoading}
            style={{ marginTop: 16 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Register as Donor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 5,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#FFF',
  },
  errorMsg: {
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: Colors.danger + '20',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  footerText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  footerLink: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
});
