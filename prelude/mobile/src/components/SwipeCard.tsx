import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { FeedUser, SwipeDirection } from '../types';
import { ProfileCard } from './ProfileCard';
import { theme, radius, spacing } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const VELOCITY_THRESHOLD = 800;

interface SwipeCardProps {
  user: FeedUser;
  // Whether this card is the active (top) card that can be dragged.
  isTop: boolean;
  // Stack depth (0 = top). Used to scale/offset cards behind the top one.
  index: number;
  onSwipe: (direction: SwipeDirection, user: FeedUser) => void;
}

export function SwipeCard({ user, isTop, index, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const fling = (direction: SwipeDirection) => {
    onSwipe(direction, user);
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const goRight =
        translateX.value > SWIPE_THRESHOLD || e.velocityX > VELOCITY_THRESHOLD;
      const goLeft =
        translateX.value < -SWIPE_THRESHOLD || e.velocityX < -VELOCITY_THRESHOLD;

      if (goRight) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {
          velocity: e.velocityX,
          damping: 18,
        });
        runOnJS(fling)('like');
      } else if (goLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {
          velocity: e.velocityX,
          damping: 18,
        });
        runOnJS(fling)('pass');
      } else {
        translateX.value = withSpring(0, { damping: 16 });
        translateY.value = withSpring(0, { damping: 16 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-12, 0, 12],
    );
    // Cards behind the top one sit slightly scaled down and pushed back.
    const restingScale = 1 - Math.min(index, 2) * 0.04;
    const restingTranslateY = Math.min(index, 2) * 10;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + (isTop ? 0 : restingTranslateY) },
        { rotate: `${rotate}deg` },
        { scale: isTop ? 1 : restingScale },
      ],
    };
  });

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]} pointerEvents={isTop ? 'auto' : 'none'}>
        <ProfileCard user={user} />

        {isTop && (
          <>
            <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
              <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.overlay, styles.passOverlay, passOverlayStyle]}>
              <Text style={[styles.overlayText, styles.passText]}>PASS</Text>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
  overlay: {
    position: 'absolute',
    top: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 3,
  },
  likeOverlay: {
    left: spacing.xl,
    borderColor: '#4ADE80',
    transform: [{ rotate: '-12deg' }],
  },
  passOverlay: {
    right: spacing.xl,
    borderColor: '#F87171',
    transform: [{ rotate: '12deg' }],
  },
  overlayText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  likeText: {
    color: '#4ADE80',
  },
  passText: {
    color: '#F87171',
  },
});
