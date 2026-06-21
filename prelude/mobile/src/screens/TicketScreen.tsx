import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { useEventStore } from '../store/useEventStore';
import { purchaseTicket } from '../api/tickets';

type Props = NativeStackScreenProps<RootStackParamList, 'Ticket'>;

export function TicketScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { selectedEvent, markUnlocked } = useEventStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const event = selectedEvent && selectedEvent.id === eventId ? selectedEvent : null;
  const price = typeof event?.ticket_price === 'number' ? event.ticket_price : 0;

  const onPay = async () => {
    setError(null);
    setLoading(true);
    try {
      await purchaseTicket(eventId);
      markUnlocked(eventId);
      navigation.replace('Swipe', { eventId });
    } catch {
      // MVP: mock payment always "succeeds" locally even if the backend is offline.
      markUnlocked(eventId);
      navigation.replace('Swipe', { eventId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.ticket}>
        <Text style={styles.eventName}>{event?.name ?? 'Event'}</Text>
        <Text style={styles.venue}>{event?.venue ?? 'Secret venue'}</Text>

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Entry ticket</Text>
          <Text style={styles.priceValue}>{price === 0 ? 'Free' : `$${price}`}</Text>
        </View>

        <Text style={styles.note}>
          Buying a ticket unlocks the attendee list so you can match and chat before
          the night begins.
        </Text>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        title={price === 0 ? 'Reserve & Unlock' : `Pay $${price} (mock) & Unlock`}
        onPress={onPay}
        loading={loading}
        style={styles.cta}
      />
      <Text style={styles.disclaimer}>This is a mock payment for the MVP.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  ticket: {
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  eventName: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '900',
  },
  venue: {
    color: theme.subtext,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: theme.text,
    fontSize: 16,
  },
  priceValue: {
    color: theme.accent,
    fontSize: 20,
    fontWeight: '800',
  },
  note: {
    color: theme.subtext,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.lg,
  },
  error: {
    color: '#F87171',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.xl,
  },
  disclaimer: {
    color: theme.subtext,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
