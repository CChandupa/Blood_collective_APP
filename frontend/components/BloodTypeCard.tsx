import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

interface BloodTypeCardProps {
  bloodGroup: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function BloodTypeCard({ 
  bloodGroup, 
  selected = false, 
  onPress,
  size = 'medium' 
}: BloodTypeCardProps) {
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { size: 40, fontSize: 14 };
      case 'large': return { size: 80, fontSize: 24 };
      case 'medium':
      default: return { size: 60, fontSize: 18 };
    }
  };

  const s = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: s.size, height: s.size },
        selected ? styles.selectedCard : null
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        { fontSize: s.fontSize },
        selected ? styles.selectedText : null
      ]}>
        {bloodGroup}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: Colors.primaryLight + '20', // with opacity
    borderColor: Colors.primary,
  },
  text: {
    color: Colors.textSecondary,
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  selectedText: {
    color: Colors.primary,
  },
});
