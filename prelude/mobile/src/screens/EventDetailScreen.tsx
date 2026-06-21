import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { Tag } from '../components/Tag';
import { useEventStore } from '../store/useEventStore';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

function formatRange(start?: string, end?: string): string {
  const fmt = (iso?: string) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  const s = fmt(start);
  const e = fmt(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? 'Time TBA';
}

export function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { selectedEvent, loading, loadEvent, isUnlocked } = useEventStore();

  useEffect(() => {
    if (!selectedEvent || selectedEvent.id !== eventId) {
      loadEvent(eventId);
    }
  }, [eventId, selectedEvent, loadEvent]);

  const event = selectedEvent && selectedEvent.id === eventId ? selectedEvent : null;
  const unlocked = isUnlocked(eventId);

  if (loading && !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const tags = event?.vibe_tags ?? [];
  const count = event?.attendees_count ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.name}>{event?.name ?? 'Event'}</Text>
      <Text style={styles.venue}>{event?.venue ?? 'Secret venue'}</Text>
      <Text style={styles.time}>{formatRange(event?.start_time, event?.end_time)}</Text>

      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      )}

      {!!event?.description && (
        <Text style={styles.description}>{event.description}</Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {unlocked ? count : `🔒 ${count}`}
          </Text>
          <Text style={styles.statLabel}>attendees</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {typeof event?.capacity === 'number' ? event.capacity : '—'}
          </Text>
          <Text style={styles.statLabel}>capacity</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {typeof event?.ticket_price === 'number'
              ? event.ticket_price === 0
                ? 'Free'
                : `$${event.ticket_price}`
              : '—'}
          </Text>
          <Text style={styles.statLabel}>ticket</Text>
        </View>
      </View>

      {unlocked ? (
        <>
          <PrimaryButton
            title="Browse Attendees"
            onPress={() => navigation.navigate('Swipe', { eventId })}
            style={styles.cta}
          />
          <PrimaryButton
            title="My Matches"
            variant="outline"
            onPress={() => navigation.navigate('Matches', { eventId })}
            style={styles.ctaSecondary}
          />
        </>
      ) : (
        <PrimaryButton
          title="Get a Ticket to Unlock"
          onPress={() => navigation.navigate('Ticket', { eventId })}
          style={styles.cta}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '900',
  },
  venue: {
    color: theme.text,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  time: {
    color: theme.subtext,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
  },
  description: {
    color: theme.subtext,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statValue: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.subtext,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  cta: {
    marginTop: spacing.xl,
  },
  ctaSecondary: {
    marginTop: spacing.md,
  },
});
