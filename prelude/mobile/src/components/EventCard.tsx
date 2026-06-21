import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PreludeEvent } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { Tag } from './Tag';

interface EventCardProps {
  event: PreludeEvent;
  unlocked: boolean;
  onPress: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return 'TBA';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function EventCard({ event, unlocked, onPress }: EventCardProps) {
  const tags = event.vibe_tags ?? [];
  const count = event.attendees_count ?? 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.name} numberOfLines={1}>
        {event.name ?? 'Untitled Event'}
      </Text>

      <Text style={styles.meta} numberOfLines={1}>
        {event.venue ?? 'Secret venue'} · {formatDate(event.start_time)}
      </Text>

      {!!event.description && (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.slice(0, 4).map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.attendees}>
          {unlocked ? `${count} going` : `🔒 ${count} attendees · unlock with a ticket`}
        </Text>
        {typeof event.ticket_price === 'number' && (
          <Text style={styles.price}>
            {event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  name: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  meta: {
    color: theme.subtext,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  description: {
    color: theme.subtext,
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  attendees: {
    color: theme.subtext,
    fontSize: 13,
    flex: 1,
  },
  price: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});
