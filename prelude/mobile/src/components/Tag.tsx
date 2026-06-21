import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme, radius, spacing } from '../constants/theme';

interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: 'rgba(124, 92, 255, 0.15)',
    borderColor: 'rgba(124, 92, 255, 0.4)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
