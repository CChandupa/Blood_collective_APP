import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BloodTypeCard } from '../components/BloodTypeCard';
import { SearchableSelect } from '../components/SearchableSelect';
import { Colors, Fonts } from '../constants/theme';
import { BLOOD_TYPES } from '../constants/bloodTypes';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';

export default function RequestBlood() {
  const router = useRouter();
  const { isMobile, responsive, fs } = useResponsive();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [fetchingHospitals, setFetchingHospitals] = useState(true);

  const [formData, setFormData] = useState({
    patient_name: '',
    blood_type_id: 0,
    hospital_id: 0,
    urgency_level: 'High',
    quantity_needed: '1',
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        if (res.data.success) {
          setHospitals(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, hospital_id: res.data.data[0].hospital_id }));
          }
        }
      } catch (err) {
        console.error('Failed to load hospitals', err);
      } finally {
        setFetchingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  const handleSubmit = async () => {
    if (!formData.patient_name || !formData.blood_type_id || !formData.hospital_id || !formData.quantity_needed) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Create the request
      const response = await api.post('/requests', {
        ...formData,
        quantity_needed: parseInt(formData.quantity_needed),
      });

      if (response.data.success) {
        // Request created successfully and is now Pending. Admin will review and match.
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={[
          styles.successCard,
          {
            maxWidth: responsive(360, 450, 500),
            padding: responsive(24, 32, 40),
          }
        ]}>
          <Text style={[styles.successTitle, { fontSize: fs(responsive(20, 22, 24)) }]}>
            Request Submitted Successfully!
          </Text>
          <Text style={[styles.successDesc, { fontSize: fs(responsive(14, 15, 16)) }]}>
            Your blood request has been created and is currently Pending. An administrator will review your request shortly and refer you to the nearest matching donor.
          </Text>
          <Button 
            title="Return to Home" 
            onPress={() => router.push('/')} 
            style={{ marginTop: 24 }} 
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[
        styles.card,
        {
          maxWidth: responsive(360, 520, 600),
          padding: responsive(20, 28, 32),
        }
      ]}>
        <Text style={[styles.title, { fontSize: fs(responsive(24, 28, 32)) }]}>Request Blood</Text>
        <Text style={[styles.subtitle, { fontSize: fs(responsive(13, 15, 16)) }]}>
          Submit an emergency blood request. Our system will notify matched donors instantly.
        </Text>
        
        {error ? <Text style={styles.errorMsg}>{error}</Text> : null}

        <Input 
          label="Patient Name *"
          placeholder="Enter patient's full name"
          value={formData.patient_name}
          onChangeText={text => setFormData({...formData, patient_name: text})}
        />

        <Text style={styles.sectionLabel}>Required Blood Type *</Text>
        <View style={styles.bloodTypeGrid}>
          {BLOOD_TYPES.map(bt => (
            <BloodTypeCard 
              key={bt.id}
              bloodGroup={bt.group}
              selected={formData.blood_type_id === bt.id}
              onPress={() => setFormData({...formData, blood_type_id: bt.id})}
              size="small"
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Hospital *</Text>
        {fetchingHospitals ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <SearchableSelect
            data={hospitals.map(h => ({ id: h.hospital_id, label: h.hospital_name }))}
            value={formData.hospital_id}
            onSelect={(id) => setFormData({...formData, hospital_id: id as number})}
            placeholder="Select a Hospital"
            searchPlaceholder="Search hospital name..."
          />
        )}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Urgency Level *</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'web' ? (
            <select 
              style={styles.webSelect as any}
              value={formData.urgency_level}
              onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
            >
              <option value="Critical" style={{ backgroundColor: Colors.surfaceElevated, color: Colors.text }}>Critical (Within 24 hours)</option>
              <option value="High" style={{ backgroundColor: Colors.surfaceElevated, color: Colors.text }}>High (Within 48 hours)</option>
              <option value="Medium" style={{ backgroundColor: Colors.surfaceElevated, color: Colors.text }}>Medium (Within a week)</option>
            </select>
          ) : (
            <Text style={{ color: Colors.text, padding: 12 }}>Use native picker</Text>
          )}
        </View>

        <Input 
          label="Units Needed *"
          placeholder="e.g. 2"
          value={formData.quantity_needed}
          onChangeText={text => setFormData({...formData, quantity_needed: text})}
          keyboardType="numeric"
          style={{ marginTop: 24 }}
        />

        <Button 
          title="Submit Emergency Request" 
          onPress={handleSubmit} 
          isLoading={isLoading}
          style={{ marginTop: 32 }}
          variant="danger"
          size={isMobile ? 'medium' : 'large'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    paddingTop: 32,
    paddingBottom: 60,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 12,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    height: 48,
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
  errorMsg: {
    color: Colors.danger,
    marginBottom: 16,
    backgroundColor: Colors.danger + '20',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  successCard: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  successTitle: {
    fontFamily: Fonts.bold,
    color: Colors.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  successDesc: {
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
