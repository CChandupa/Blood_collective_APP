import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { PatientRequest } from '../types';
import { Building, AlertCircle, Calendar } from 'lucide-react-native';

interface RequestCardProps {
  request: PatientRequest;
  onPress?: () => void;
}

export function RequestCard({ request, onPress }: RequestCardProps) {
  
  const getUrgencyColor = () => {
    switch(request.urgency_level?.toLowerCase()) {
      case 'critical': return Colors.danger;
      case 'high': return Colors.warning;
      case 'medium': return Colors.primary;
      default: return Colors.success;
    }
  };

  const getStatusColor = () => {
    switch(request.status?.toLowerCase()) {
      case 'matched': return Colors.success;
      case 'completed': return Colors.textSecondary;
      default: return Colors.warning; // pending
    }
  };

  const urgencyColor = getUrgencyColor();
  const statusColor = getStatusColor();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.bloodTypeBadge}>
          <Text style={styles.bloodTypeText}>{request.blood_type?.blood_group}</Text>
        </View>
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { borderColor: urgencyColor }]}>
            <AlertCircle color={urgencyColor} size={12} />
            <Text style={[styles.tagText, { color: urgencyColor }]}>
              {request.urgency_level}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[styles.tagText, { color: statusColor }]}>
              {request.status}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.patientName}>{request.patient_name}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Building color={Colors.textSecondary} size={16} />
          <Text style={styles.detailText}>{request.hospital?.hospital_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar color={Colors.textSecondary} size={16} />
          <Text style={styles.detailText}>
            Needed by: {new Date(request.request_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.quantityText}>
          {request.quantity_needed} Unit(s) Needed
        </Text>
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
    marginBottom: 12,
  },
  bloodTypeBadge: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  bloodTypeText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
  patientName: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 16,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  quantityText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
});
