import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { FeedUser } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { Tag } from './Tag';

interface ProfileCardProps {
  user: FeedUser;
}

// Visual content of a swipeable profile. Kept presentational so SwipeCard can
// wrap it with gesture/animation logic.
export function ProfileCard({ user }: ProfileCardProps) {
  const interests = user.interests ?? [];
  const initial = (user.name ?? '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>
          {user.name ?? 'Someone'}
          {typeof user.age === 'number' ? `, ${user.age}` : ''}
        </Text>

        {typeof user.score === 'number' && (
          <Text style={styles.score}>{Math.round(user.score * 100)}% vibe match</Text>
        )}

        {interests.length > 0 && (
          <View style={styles.tags}>
            {interests.slice(0, 6).map((i) => (
              <Tag key={i} label={i} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  avatarWrap: {
    flex: 1,
    backgroundColor: 'rgba(124, 92, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.text,
    fontSize: 56,
    fontWeight: '800',
  },
  body: {
    padding: spacing.xl,
  },
  name: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '800',
  },
  score: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
});
