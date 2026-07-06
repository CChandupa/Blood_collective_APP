import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Colors, Fonts } from '../../constants/theme';
import { api } from '../../services/api';
import { Bell } from 'lucide-react-native';

export default function DonorDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [donorDetails, setDonorDetails] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [donorRes, notifRes, schedRes] = await Promise.all([
        api.get(`/donors/${user.id}`),
        api.get('/notifications'),
        api.get('/schedules')
      ]);
      
      if (donorRes.data.success) setDonorDetails(donorRes.data.data);
      if (notifRes.data.success) setNotifications(notifRes.data.data);
      if (schedRes.data.success) setSchedules(schedRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/auth/login');
    } else if (user) {
      fetchData();
    }
  }, [user, isAuthLoading]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !donorDetails?.availability_status;
      await api.put('/donors', { availability_status: newStatus });
      setDonorDetails((prev: any) => ({ ...prev, availability_status: newStatus }));
    } catch (error) {
      console.error('Failed to update availability', error);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await api.put('/notifications', { notification_id: id });
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, read_status: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  if (!user || !donorDetails) {
    return <View style={styles.container} />; // Loading state can be added
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.greeting}>Hello, {donorDetails.full_name}</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.bloodTypeBadge}>
            <Text style={styles.bloodTypeText}>{donorDetails.blood_type?.blood_group}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <View style={[styles.statusPill, { backgroundColor: donorDetails.availability_status ? Colors.success + '20' : Colors.danger + '20' }]}>
              <Text style={[styles.statusText, { color: donorDetails.availability_status ? Colors.success : Colors.danger }]}>
                {donorDetails.availability_status ? 'Available to Donate' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
        <Button 
          title={donorDetails.availability_status ? "Mark as Unavailable" : "Mark as Available"} 
          onPress={toggleAvailability} 
          variant={donorDetails.availability_status ? "outline" : "primary"}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>You have no new notifications.</Text>
        ) : (
          notifications.map(notif => (
            <View key={notif.notification_id} style={[styles.notificationCard, !notif.read_status && styles.unreadNotification]}>
              <View style={styles.notifIcon}>
                <Bell color={Colors.primary} size={20} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifDate}>{new Date(notif.sent_date).toLocaleDateString()}</Text>
                {!notif.read_status && (
                  <Button 
                    title="Mark as Read" 
                    onPress={() => markNotificationRead(notif.notification_id)} 
                    size="small" 
                    variant="outline" 
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  />
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Upcoming Donations</Text>
        {schedules.length === 0 ? (
          <Text style={styles.emptyText}>You have no scheduled donations.</Text>
        ) : (
          schedules.map(sched => (
            <View key={sched.schedule_id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleHospital}>{sched.patient_request?.hospital?.hospital_name}</Text>
                <View style={[styles.statusPill, { backgroundColor: Colors.warning + '20' }]}>
                   <Text style={{ color: Colors.warning, fontWeight: 'bold' }}>{sched.donation_status}</Text>
                </View>
              </View>
              <Text style={styles.scheduleDate}>Date: {sched.donation_date}</Text>
              <Text style={styles.schedulePatient}>Patient: {sched.patient_request?.patient_name} (Needs {sched.patient_request?.blood_type?.blood_group})</Text>
            </View>
          ))
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
    padding: 24,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  greeting: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: Colors.surfaceElevated,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  bloodTypeBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  bloodTypeText: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: Fonts.bold,
  },
  statusContainer: {
    flex: 1,
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.primary,
  },
  notifIcon: {
    marginRight: 16,
  },
  notifContent: {
    flex: 1,
  },
  notifMessage: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  notifDate: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  scheduleCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleHospital: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  scheduleDate: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  schedulePatient: {
    color: Colors.text,
    fontSize: 16,
  },
});
