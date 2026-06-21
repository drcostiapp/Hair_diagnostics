import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedUser, RootStackParamList, SwipeDirection } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { SwipeCard } from '../components/SwipeCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { getFeed, like, pass, superlike } from '../api/social';
import { useMatchStore } from '../store/useMatchStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

export function SwipeScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const [feed, setFeed] = useState<FeedUser[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastMatch = useMatchStore((s) => s.lastMatch);
  const addMatch = useMatchStore((s) => s.addMatch);
  const clearLastMatch = useMatchStore((s) => s.clearLastMatch);
  const bindSocket = useMatchStore((s) => s.bindSocket);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await getFeed(eventId);
        if (active) setFeed(users);
      } catch (e) {
        if (active) setError((e as Error)?.message ?? 'Failed to load feed');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  // Listen for realtime match events while swiping.
  useEffect(() => {
    const unbind = bindSocket();
    return unbind;
  }, [bindSocket]);

  const handleSwipe = useCallback(
    async (direction: SwipeDirection, user: FeedUser) => {
      setCursor((c) => c + 1);
      try {
        let result;
        if (direction === 'pass') {
          result = await pass(eventId, user.user_id);
        } else if (direction === 'superlike') {
          result = await superlike(eventId, user.user_id);
        } else {
          result = await like(eventId, user.user_id);
        }
        if (result?.matched && result.match) {
          addMatch(result.match);
        }
      } catch {
        // Swallow swipe errors in the MVP so the deck keeps flowing.
      }
    },
    [eventId, addMatch],
  );

  const onButtonSwipe = (direction: SwipeDirection) => {
    const user = feed[cursor];
    if (user) handleSwipe(direction, user);
  };

  const remaining = feed.slice(cursor);
  const showMatchBanner = !!lastMatch;

  return (
    <View style={styles.container}>
      <View style={styles.deck}>
        {loading ? (
          <ActivityIndicator color={theme.accent} />
        ) : remaining.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>That's everyone</Text>
            <Text style={styles.emptySub}>
              {error ? error : 'Check back later for more people at this event.'}
            </Text>
            <PrimaryButton
              title="See Matches"
              onPress={() => navigation.navigate('Matches', { eventId })}
              style={styles.emptyCta}
            />
          </View>
        ) : (
          // Render up to 3 cards, top-most last so it sits on top.
          remaining
            .slice(0, 3)
            .map((user, i) => ({ user, i }))
            .reverse()
            .map(({ user, i }) => (
              <SwipeCard
                key={user.user_id}
                user={user}
                index={i}
                isTop={i === 0}
                onSwipe={handleSwipe}
              />
            ))
        )}
      </View>

      {!loading && remaining.length > 0 && (
        <View style={styles.actions}>
          <PrimaryButton
            title="Pass"
            variant="outline"
            onPress={() => onButtonSwipe('pass')}
            style={styles.actionBtn}
          />
          <PrimaryButton
            title="Like"
            onPress={() => onButtonSwipe('like')}
            style={styles.actionBtn}
          />
        </View>
      )}

      {showMatchBanner && (
        <View style={styles.banner} pointerEvents="box-none">
          <View style={styles.bannerInner}>
            <Text style={styles.bannerTitle}>It's a match! ✨</Text>
            <Text style={styles.bannerSub}>You both want to meet tonight.</Text>
            <View style={styles.bannerActions}>
              <PrimaryButton
                title="Keep Swiping"
                variant="outline"
                onPress={clearLastMatch}
                style={styles.bannerBtn}
              />
              <PrimaryButton
                title="Chat"
                onPress={() => {
                  const chatId = lastMatch?.chat_id ?? lastMatch?.id ?? '';
                  clearLastMatch();
                  navigation.navigate('Chat', {
                    eventId,
                    chatId,
                    peerName: lastMatch?.name,
                  });
                }}
                style={styles.bannerBtn}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    padding: spacing.xl,
  },
  deck: {
    flex: 1,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  emptySub: {
    color: theme.subtext,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyCta: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  banner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,11,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  bannerInner: {
    backgroundColor: theme.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  bannerTitle: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  bannerSub: {
    color: theme.subtext,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  bannerActions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  bannerBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
