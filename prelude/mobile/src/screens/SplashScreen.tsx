import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { theme, spacing } from '../constants/theme';
import { useUserStore } from '../store/useUserStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const token = useUserStore((s) => s.token);

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace(token ? 'Events' : 'Login');
    }, 1200);
    return () => clearTimeout(t);
  }, [navigation, token]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>PRELUDE</Text>
      <Text style={styles.tagline}>The night starts before you arrive.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: theme.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 6,
  },
  tagline: {
    color: theme.subtext,
    fontSize: 15,
    marginTop: spacing.md,
  },
});
