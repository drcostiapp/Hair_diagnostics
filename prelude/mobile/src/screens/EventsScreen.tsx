import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PreludeEvent, RootStackParamList } from '../types';
import { theme, spacing } from '../constants/theme';
import { EventCard } from '../components/EventCard';
import { useEventStore } from '../store/useEventStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Events'>;

export function EventsScreen({ navigation }: Props) {
  const { events, loading, error, loadEvents, isUnlocked, selectEvent } = useEventStore();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const renderItem = ({ item }: { item: PreludeEvent }) => (
    <EventCard
      event={item}
      unlocked={isUnlocked(item.id)}
      onPress={() => {
        selectEvent(item);
        navigation.navigate('EventDetail', { eventId: item.id });
      }}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tonight</Text>

      {loading && events.length === 0 ? (
        <ActivityIndicator color={theme.accent} style={styles.center} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadEvents}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error ? `Couldn't load events: ${error}` : 'No events nearby yet.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  heading: {
    color: theme.text,
    fontSize: 30,
    fontWeight: '900',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  center: {
    marginTop: spacing.xxl,
  },
  empty: {
    color: theme.subtext,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
