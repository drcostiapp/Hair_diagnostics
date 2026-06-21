import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Match } from '../types';
import { theme, radius, spacing } from '../constants/theme';

interface MatchRowProps {
  match: Match;
  onPress: () => void;
}

export function MatchRow({ match, onPress }: MatchRowProps) {
  const label = match.name ?? match.user_b ?? match.user_a ?? 'Match';
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          Tap to chat
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: theme.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: theme.subtext,
    fontSize: 28,
    marginLeft: spacing.sm,
  },
});
