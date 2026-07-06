import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: Colors.surfaceElevated, text: Colors.text };
      case 'outline':
        return { bg: 'transparent', text: Colors.primary, border: Colors.primary };
      case 'danger':
        return { bg: Colors.danger, text: '#FFF' };
      case 'primary':
      default:
        return { bg: Colors.primary, text: '#FFF' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { py: 8, px: 16, fontSize: 14 };
      case 'large': return { py: 16, px: 32, fontSize: 18 };
      case 'medium':
      default: return { py: 12, px: 24, fontSize: 16 };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: vStyles.bg, 
          paddingVertical: sStyles.py,
          paddingHorizontal: sStyles.px,
          borderColor: vStyles.border || 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled || isLoading ? 0.6 : 1,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={vStyles.text} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { color: vStyles.text, fontSize: sStyles.fontSize },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Fonts.bold,
    fontWeight: '600',
  },
});
