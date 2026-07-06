import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BloodTypeCard } from '../components/BloodTypeCard';
import { Colors, Fonts } from '../constants/theme';
import { BLOOD_TYPES } from '../constants/bloodTypes';
import { api } from '../services/api';

export default function RequestBlood() {
  const router = useRouter();
  
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
        const requestId = response.data.data.request_id;
        
        // 2. Automatically trigger matching algorithm
        await api.post(`/requests/${requestId}/match`);
        
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
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Request Submitted Successfully!</Text>
          <Text style={styles.successDesc}>
            Your blood request has been created and our system is currently matching it with nearby donors. We will notify them immediately.
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
      <View style={styles.card}>
        <Text style={styles.title}>Request Blood</Text>
        <Text style={styles.subtitle}>Submit an emergency blood request. Our system will notify matched donors instantly.</Text>
        
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
          <View style={styles.pickerContainer}>
            {Platform.OS === 'web' ? (
              <select 
                style={styles.webSelect as any}
                value={formData.hospital_id}
                onChange={(e) => setFormData({...formData, hospital_id: parseInt(e.target.value)})}
              >
                <option value={0} disabled>Select Hospital</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>
                    {h.hospital_name}
                  </option>
                ))}
              </select>
            ) : (
              <Text style={{ color: Colors.text, padding: 12 }}>Use native picker</Text>
            )}
          </View>
        )}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Urgency Level *</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'web' ? (
            <select 
              style={styles.webSelect as any}
              value={formData.urgency_level}
              onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
            >
              <option value="Critical">Critical (Within 24 hours)</option>
              <option value="High">High (Within 48 hours)</option>
              <option value="Medium">Medium (Within a week)</option>
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
          size="large"
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    gap: 12,
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
    border: 'none',
    outline: 'none',
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
    padding: 20,
  },
  successCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surfaceElevated,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
