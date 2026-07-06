import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BloodTypeCard } from '../components/BloodTypeCard';
import { DonorCard } from '../components/DonorCard';
import { Colors, Fonts } from '../constants/theme';
import { BLOOD_TYPES } from '../constants/bloodTypes';
import { DISTRICTS } from '../constants/districts';
import { api } from '../services/api';
import { Donor } from '../types';
import { Platform } from 'react-native';

export default function SearchDonors() {
  const router = useRouter();
  
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBloodType, setSelectedBloodType] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      let url = '/donors?available_only=true';
      if (selectedBloodType) url += `&blood_type_id=${selectedBloodType}`;
      if (selectedDistrict) url += `&district=${selectedDistrict}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        setDonors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch donors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodType, selectedDistrict]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Blood Donors</Text>
        <Text style={styles.subtitle}>Connect with available donors in your area</Text>
      </View>
      
      <View style={styles.filtersSection}>
        <Text style={styles.sectionLabel}>Filter by Blood Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bloodTypeScroll}>
          <BloodTypeCard 
            bloodGroup="All"
            selected={selectedBloodType === null}
            onPress={() => setSelectedBloodType(null)}
            size="small"
          />
          {BLOOD_TYPES.map(bt => (
            <BloodTypeCard 
              key={bt.id}
              bloodGroup={bt.group}
              selected={selectedBloodType === bt.id}
              onPress={() => setSelectedBloodType(bt.id)}
              size="small"
            />
          ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Filter by District</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'web' ? (
            <select 
              style={styles.webSelect as any}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          ) : (
            <Text style={{ color: Colors.text, padding: 12 }}>Use native picker</Text>
          )}
        </View>
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.resultsHeader}>
          {isLoading ? 'Searching...' : `Found ${donors.length} Available Donors`}
        </Text>
        
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : donors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No donors found matching your criteria.</Text>
          </View>
        ) : (
          <View style={styles.donorsList}>
            {donors.map(donor => (
              <DonorCard key={donor.donor_id} donor={donor} />
            ))}
          </View>
        )}
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
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
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
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  filtersSection: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 12,
  },
  bloodTypeScroll: {
    gap: 12,
    paddingBottom: 8,
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
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  donorsList: {
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
});
