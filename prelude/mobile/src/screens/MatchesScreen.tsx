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
import type { Match, RootStackParamList } from '../types';
import { theme, spacing } from '../constants/theme';
import { MatchRow } from '../components/MatchRow';
import { useMatchStore } from '../store/useMatchStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Matches'>;

export function MatchesScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { matches, loading, error, loadMatches, bindSocket } = useMatchStore();

  useEffect(() => {
    loadMatches(eventId);
  }, [eventId, loadMatches]);

  // Keep receiving new matches in realtime while this screen is mounted.
  useEffect(() => {
    const unbind = bindSocket();
    return unbind;
  }, [bindSocket]);

  const renderItem = ({ item }: { item: Match }) => (
    <MatchRow
      match={item}
      onPress={() =>
        navigation.navigate('Chat', {
          eventId,
          chatId: item.chat_id ?? item.id,
          peerName: item.name,
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Matches</Text>

      {loading && matches.length === 0 ? (
        <ActivityIndicator color={theme.accent} style={styles.center} />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => loadMatches(eventId)}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error
                ? `Couldn't load matches: ${error}`
                : 'No matches yet. Keep swiping!'}
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
