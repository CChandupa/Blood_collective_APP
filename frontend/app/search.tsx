import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BloodTypeCard } from '../components/BloodTypeCard';
import { DonorCard } from '../components/DonorCard';
import { Colors, Fonts } from '../constants/theme';
import { BLOOD_TYPES } from '../constants/bloodTypes';
import { DISTRICTS } from '../constants/districts';
import { useResponsive } from '../hooks/useResponsive';
import { api } from '../services/api';
import { Donor } from '../types';

export default function SearchDonors() {
  const router = useRouter();
  const { isMobile, responsive, fs } = useResponsive();
  
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
    <ScrollView style={styles.container} contentContainerStyle={[
      styles.content,
      {
        maxWidth: responsive(500, 700, 800),
        padding: responsive(12, 16, 20),
      }
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: fs(responsive(24, 28, 32)) }]}>Find Blood Donors</Text>
        <Text style={[styles.subtitle, { fontSize: fs(responsive(13, 15, 16)) }]}>
          Connect with available donors in your area
        </Text>
      </View>
      
      <View style={[styles.filtersSection, { padding: responsive(16, 20, 24) }]}>
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
              <option value="" style={{ backgroundColor: Colors.surfaceElevated, color: Colors.text }}>All Districts</option>
              {DISTRICTS.map(dist => (
                <option key={dist} value={dist} style={{ backgroundColor: Colors.surfaceElevated, color: Colors.text }}>{dist}</option>
              ))}
            </select>
          ) : (
            <Text style={{ color: Colors.text, padding: 12 }}>Use native picker</Text>
          )}
        </View>
      </View>

      <View style={styles.resultsSection}>
        <Text style={[styles.resultsHeader, { fontSize: fs(responsive(15, 17, 18)) }]}>
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
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  filtersSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 12,
  },
  bloodTypeScroll: {
    gap: 10,
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
    borderWidth: 0,
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    fontFamily: Fonts.bold,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  donorsList: {
    gap: 12,
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
