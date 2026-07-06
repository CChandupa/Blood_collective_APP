import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Fonts } from '../../constants/theme';
import { api } from '../../services/api';
import { RequestCard } from '../../components/RequestCard';
import { DonorCard } from '../../components/DonorCard';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [reqRes, donorRes] = await Promise.all([
        api.get('/requests'),
        api.get('/donors')
      ]);
      
      if (reqRes.data.success) setRequests(reqRes.data.data);
      if (donorRes.data.success) setDonors(donorRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login');
    } else if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, isAuthLoading]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  if (!user || user.role !== 'admin') {
    return <View style={styles.container} />;
  }

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const availableDonorsCount = donors.filter(d => d.availability_status).length;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.title}>Admin Control Center</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{requests.length}</Text>
          <Text style={styles.statLabel}>Total Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>{pendingRequests.length}</Text>
          <Text style={styles.statLabel}>Pending Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{availableDonorsCount}</Text>
          <Text style={styles.statLabel}>Available Donors</Text>
        </View>
      </View>

      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Recent Blood Requests</Text>
          {requests.slice(0, 10).map(req => (
            <RequestCard key={req.request_id} request={req} />
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Recently Registered Donors</Text>
          {donors.slice(0, 10).map(donor => (
            <DonorCard key={donor.donor_id} donor={donor} showContact={true} />
          ))}
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
  content: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Colors.surfaceElevated,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  column: {
    flex: 1,
    minWidth: 300,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 16,
  },
});
