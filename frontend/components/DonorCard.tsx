import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { Donor } from '../types';
import { MapPin, Phone, Calendar } from 'lucide-react-native';

interface DonorCardProps {
  donor: Donor;
  showContact?: boolean;
  onToggleBlock?: () => void;
}

export function DonorCard({ donor, showContact = false, onToggleBlock }: DonorCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{donor.full_name}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: donor.availability_status ? Colors.success + '20' : Colors.danger + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: donor.availability_status ? Colors.success : Colors.danger }
            ]}>
              {donor.availability_status ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          {onToggleBlock && (
            <TouchableOpacity 
              onPress={onToggleBlock}
              style={[
                styles.blockBadge, 
                { backgroundColor: (donor as any).is_blocked ? Colors.success + '20' : Colors.danger + '20' }
              ]}
            >
              <Text style={[
                styles.statusText,
                { color: (donor as any).is_blocked ? Colors.success : Colors.danger }
              ]}>
                {(donor as any).is_blocked ? 'Unblock' : 'Block'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.bloodTypeBadge}>
            <Text style={styles.bloodTypeText}>{donor.blood_type?.blood_group}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MapPin color={Colors.textSecondary} size={16} />
          <Text style={styles.detailText}>
            {donor.location?.city}, {donor.location?.district}
          </Text>
        </View>
        
        {donor.last_donation_date && (
          <View style={styles.detailRow}>
            <Calendar color={Colors.textSecondary} size={16} />
            <Text style={styles.detailText}>
              Last donated: {new Date(donor.last_donation_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {showContact && donor.mobile_no && (
          <View style={styles.detailRow}>
            <Phone color={Colors.primary} size={16} />
            <Text style={[styles.detailText, { color: Colors.text }]}>
              {donor.mobile_no}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bloodTypeBadge: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodTypeText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
});
