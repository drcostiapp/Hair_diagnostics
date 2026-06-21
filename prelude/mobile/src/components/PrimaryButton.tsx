import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { theme, radius, spacing } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' ? styles.solid : styles.outline,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? theme.text : theme.accent} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  solid: {
    backgroundColor: theme.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: theme.accent,
  },
});
