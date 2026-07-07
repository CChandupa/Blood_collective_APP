import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Fonts } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { api } from '../../services/api';
import { RequestCard } from '../../components/RequestCard';
import { DonorCard } from '../../components/DonorCard';
import { Button } from '../../components/Button';
import { X, Send } from 'lucide-react-native';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isMobile, isDesktop, responsive, fs } = useResponsive();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification State
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [matchingDonors, setMatchingDonors] = useState<any[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

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

  const handleToggleBlock = async (donorId: number, currentBlocked: boolean) => {
    try {
      const res = await api.post(`/donors/${donorId}/block`, { is_blocked: !currentBlocked });
      if (res.data.success) {
        setDonors(donors.map(d => d.donor_id === donorId ? { ...d, is_blocked: !currentBlocked } : d));
      }
    } catch (err) {
      console.error('Failed to toggle block status', err);
      if (Platform.OS === 'web') alert('Failed to update donor status');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsSending(true);
    try {
      const res = await api.post('/notifications/send', { message: broadcastMessage });
      if (res.data.success) {
        setBroadcastMessage('');
        if (Platform.OS === 'web') alert('Broadcast sent successfully!');
      }
    } catch (err) {
      console.error('Failed to send broadcast', err);
      if (Platform.OS === 'web') alert('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const openRequestModal = async (req: any) => {
    setSelectedRequest(req);
    if (req.status === 'Pending') {
      setIsMatchingLoading(true);
      try {
        const res = await api.get(`/requests/${req.request_id}/match`);
        if (res.data.success) {
          setMatchingDonors(res.data.data.donors);
        }
      } catch (err) {
        console.error('Failed to fetch matching donors', err);
      } finally {
        setIsMatchingLoading(false);
      }
    }
  };

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setMatchingDonors([]);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      const res = await api.post(`/requests/${selectedRequest.request_id}/status`, { status });
      if (res.data.success) {
        setRequests(requests.map(r => r.request_id === selectedRequest.request_id ? { ...r, status } : r));
        closeRequestModal();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReferDonor = async (donorId: number) => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      const res = await api.post(`/requests/${selectedRequest.request_id}/refer`, { donor_id: donorId });
      if (res.data.success) {
        setRequests(requests.map(r => r.request_id === selectedRequest.request_id ? { ...r, status: 'Matched' } : r));
        closeRequestModal();
        if (Platform.OS === 'web') alert('Patient referred to donor successfully!');
      }
    } catch (err) {
      console.error('Failed to refer donor', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <View style={styles.container} />;
  }

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const availableDonorsCount = donors.filter(d => d.availability_status && !d.is_blocked).length;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: responsive(500, 900, 1200),
            padding: responsive(16, 20, 24),
          }
        ]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={[styles.title, { fontSize: fs(responsive(22, 26, 28)) }]}>Admin Control Center</Text>

        {/* Stats Row */}
        <View style={[styles.statsRow, { gap: responsive(10, 14, 16) }]}>
          {[
            { value: requests.length, label: 'Total Requests', color: Colors.text },
            { value: pendingRequests.length, label: 'Pending Matches', color: Colors.warning },
            { value: availableDonorsCount, label: 'Available Donors', color: Colors.success },
          ].map((stat, idx) => (
            <View key={idx} style={[
              styles.statCard,
              { 
                minWidth: isMobile ? '100%' : 160,
                padding: responsive(16, 20, 24),
              }
            ]}>
              <Text style={[styles.statValue, { fontSize: fs(responsive(24, 28, 32)), color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { fontSize: fs(responsive(12, 13, 14)) }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Broadcast Notification Panel */}
        <View style={styles.broadcastPanel}>
          <Text style={styles.sectionTitle}>Broadcast Notification</Text>
          <Text style={styles.broadcastSubtitle}>Send a message to all registered donors</Text>
          <View style={styles.broadcastInputRow}>
            <TextInput 
              style={styles.broadcastInput}
              placeholder="Enter message here..."
              placeholderTextColor={Colors.textSecondary}
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              multiline
            />
            <Button 
              title="Broadcast" 
              onPress={handleSendBroadcast} 
              isLoading={isSending}
              style={{ minWidth: 120 }}
            />
          </View>
        </View>

        {/* Two Column Layout */}
        <View style={[
          styles.twoColumn,
          { 
            flexDirection: isDesktop ? 'row' : 'column',
            gap: responsive(16, 20, 24),
          }
        ]}>
          <View style={[styles.column, { minWidth: isDesktop ? 300 : '100%' }]}>
            <Text style={[styles.sectionTitle, { fontSize: fs(responsive(17, 19, 20)) }]}>
              Recent Blood Requests
            </Text>
            <Text style={styles.columnSubtitle}>Click a request to manually refer a donor</Text>
            {requests.slice(0, 15).map(req => (
              <RequestCard 
                key={req.request_id} 
                request={req} 
                onPress={() => openRequestModal(req)} 
              />
            ))}
          </View>

          <View style={[styles.column, { minWidth: isDesktop ? 300 : '100%' }]}>
            <Text style={[styles.sectionTitle, { fontSize: fs(responsive(17, 19, 20)) }]}>
              Donor Management
            </Text>
            <Text style={styles.columnSubtitle}>Monitor and block unauthorized users</Text>
            {donors.slice(0, 15).map(donor => (
              <DonorCard 
                key={donor.donor_id} 
                donor={donor} 
                showContact={true} 
                onToggleBlock={() => handleToggleBlock(donor.donor_id, donor.is_blocked)}
              />
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Request Management Modal */}
      {selectedRequest && (
        <Modal
          visible={!!selectedRequest}
          transparent={true}
          animationType="fade"
          onRequestClose={closeRequestModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { width: isMobile ? '95%' : 600, maxHeight: '90%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Management</Text>
                <TouchableOpacity onPress={closeRequestModal}>
                  <X color={Colors.textSecondary} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <RequestCard request={selectedRequest} />

                {selectedRequest.status === 'Pending' && (
                  <View style={styles.matchSection}>
                    <Text style={styles.matchTitle}>Matching Donors</Text>
                    {isMatchingLoading ? (
                      <ActivityIndicator color={Colors.primary} style={{ margin: 24 }} />
                    ) : matchingDonors.length > 0 ? (
                      matchingDonors.map(donor => (
                        <View key={donor.donor_id} style={styles.matchDonorRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.matchDonorName}>{donor.full_name}</Text>
                            <Text style={styles.matchDonorDetails}>
                              {donor.location?.city}, {donor.location?.district}
                            </Text>
                          </View>
                          <Button 
                            title="Refer Donor" 
                            onPress={() => handleReferDonor(donor.donor_id)}
                            isLoading={isActionLoading}
                            size="small"
                          />
                        </View>
                      ))
                    ) : (
                      <View style={styles.noMatchContainer}>
                        <Text style={styles.noMatchText}>No eligible donors found for {selectedRequest.blood_type?.blood_group}.</Text>
                        <Text style={styles.noMatchSub}>You can reject the request or keep it pending.</Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button 
                  title="Keep Pending" 
                  variant="outline" 
                  onPress={closeRequestModal} 
                  disabled={isActionLoading}
                />
                {selectedRequest.status === 'Pending' && (
                  <Button 
                    title="Reject Request" 
                    variant="danger" 
                    onPress={() => handleUpdateStatus('Rejected')} 
                    isLoading={isActionLoading}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
  title: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
  },
  broadcastPanel: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  broadcastSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 16,
  },
  broadcastInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  broadcastInput: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    color: Colors.text,
    fontFamily: Fonts.regular,
    padding: 12,
    minHeight: 48,
  },
  twoColumn: {
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  columnSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  matchSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  matchTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  matchDonorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  matchDonorName: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  matchDonorDetails: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  noMatchContainer: {
    padding: 20,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    alignItems: 'center',
  },
  noMatchText: {
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: 16,
    marginBottom: 8,
  },
  noMatchSub: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
});
