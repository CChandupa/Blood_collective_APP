import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { BloodTypeCard } from '../../components/BloodTypeCard';
import { Colors, Fonts } from '../../constants/theme';
import { BLOOD_TYPES } from '../../constants/bloodTypes';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Picker } from '@react-native-picker/picker'; // You might need to install this if you want native picker, but for web we can build a simple custom one or use a standard html select for simplicity in this demo.
// For the sake of simplicity, we'll build a simple custom dropdown

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Locations data
  const [locations, setLocations] = useState<any[]>([]);
  const [fetchingLocations, setFetchingLocations] = useState(true);

  // Form Data
  const [formData, setFormData] = useState({
    full_name: '',
    nic: '',
    email: '',
    mobile_no: '',
    gender: 'Male',
    dob: '',
    password: '',
    confirmPassword: '',
    blood_type_id: 0,
    location_id: 0,
  });

  useEffect(() => {
    // Fetch locations for the dropdown
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocations(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, location_id: res.data.data[0].location_id }));
          }
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setFetchingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.nic || !formData.email || !formData.mobile_no) {
        setError('Please fill all required fields');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
    } else if (step === 2) {
      if (!formData.blood_type_id) {
        setError('Please select your blood type');
        return;
      }
      if (!formData.location_id) {
        setError('Please select a location');
        return;
      }
    } else if (step === 3) {
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setError('');
    setStep(prev => prev + 1);
  };

  const handleRegister = async () => {
    if (!formData.password || formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', {
        full_name: formData.full_name,
        nic: formData.nic,
        email: formData.email,
        mobile_no: formData.mobile_no,
        gender: formData.gender,
        dob: formData.dob || '2000-01-01',
        password: formData.password,
        blood_type_id: formData.blood_type_id,
        location_id: formData.location_id,
      });

      if (response.data.success) {
        await login(response.data.data.token, response.data.data.user);
        router.replace('/dashboard/donor');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
      setStep(1); // Go back to first step on error to check fields
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>Become a Donor</Text>
        <Text style={styles.subtitle}>Step {step} of 3</Text>
        
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.stepDot, step >= i && styles.stepDotActive]} />
          ))}
        </View>

        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

        {step === 1 && (
          <View style={styles.formSection}>
            <Input 
              label="Full Name *"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChangeText={text => setFormData({...formData, full_name: text})}
            />
            <Input 
              label="NIC Number *"
              placeholder="e.g. 981234567V"
              value={formData.nic}
              onChangeText={text => setFormData({...formData, nic: text})}
            />
            <Input 
              label="Email Address *"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChangeText={text => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input 
              label="Mobile Number *"
              placeholder="e.g. 0712345678"
              value={formData.mobile_no}
              onChangeText={text => setFormData({...formData, mobile_no: text})}
              keyboardType="phone-pad"
            />
            
            <Button title="Next Step" onPress={handleNext} style={{ marginTop: 16 }} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Select Blood Type *</Text>
            <View style={styles.bloodTypeGrid}>
              {BLOOD_TYPES.map(bt => (
                <BloodTypeCard 
                  key={bt.id}
                  bloodGroup={bt.group}
                  selected={formData.blood_type_id === bt.id}
                  onPress={() => setFormData({...formData, blood_type_id: bt.id})}
                />
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Select Location *</Text>
            {fetchingLocations ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View style={styles.pickerContainer}>
                {/* Fallback simple select for React Native Web without external dependencies */}
                {Platform.OS === 'web' ? (
                  <select 
                    style={styles.webSelect as any}
                    value={formData.location_id}
                    onChange={(e) => setFormData({...formData, location_id: parseInt(e.target.value)})}
                  >
                    <option value={0} disabled style={{ backgroundColor: 'red' }}>Select a location</option>
                    {locations.map(loc => (
                      <option key={loc.location_id} value={loc.location_id} style={{ backgroundColor: 'red' }}>
                        {loc.district} - {loc.city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Text style={{ color: Colors.text }}>Locations loaded (Use native picker on mobile)</Text>
                )}
              </View>
            )}

            <View style={styles.buttonRow}>
              <Button title="Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
              <Button title="Next Step" onPress={handleNext} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formSection}>
            <Input 
              label="Create Password *"
              placeholder="Min 6 characters"
              value={formData.password}
              onChangeText={text => setFormData({...formData, password: text})}
              secureTextEntry
            />
            <Input 
              label="Confirm Password *"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChangeText={text => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
            />
            
            <View style={styles.buttonRow}>
              <Button title="Back" onPress={() => setStep(2)} variant="outline" style={{ flex: 1 }} />
              <Button title="Register" onPress={handleRegister} isLoading={isLoading} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  stepDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  formSection: {
    width: '100%',
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 12,
    fontWeight: '500',
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    height: 50,
  },
  webSelect: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    color: Colors.text,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
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
    marginTop: 32,
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
