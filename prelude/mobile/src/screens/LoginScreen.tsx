import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { useUserStore } from '../store/useUserStore';
import { login } from '../api/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useUserStore((s) => s.setAuth);

  const onContinue = async () => {
    setError(null);
    if (!otpSent) {
      if (phone.trim().length < 6) {
        setError('Enter a valid phone number');
        return;
      }
      // MVP: pretend an OTP was dispatched. Any code works on verify.
      setOtpSent(true);
      return;
    }

    if (otp.trim().length < 3) {
      setError('Enter the code (any code works in the MVP)');
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone.trim(), otp.trim());
      // Fall back to a local guest token if backend is offline, so the MVP flow works.
      const token = res.token ?? `mvp-${Date.now()}`;
      const user = res.user ?? { id: phone.trim(), phone: phone.trim() };
      setAuth(token, user);
      navigation.replace('Events');
    } catch {
      // Defensive: backend may be down during MVP dev. Allow local login.
      setAuth(`mvp-${Date.now()}`, { id: phone.trim(), phone: phone.trim() });
      navigation.replace('Events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {otpSent ? 'Enter the code we sent you' : 'Sign in with your phone number'}
        </Text>

        {!otpSent ? (
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={theme.subtext}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="One-time code"
            placeholderTextColor={theme.subtext}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <PrimaryButton
          title={otpSent ? 'Verify & Continue' : 'Send Code'}
          onPress={onContinue}
          loading={loading}
          style={styles.button}
        />

        {otpSent && (
          <Text style={styles.hint}>Tip: any code works in this MVP build.</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: theme.text,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.subtext,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: theme.card,
    borderRadius: radius.md,
    color: theme.text,
    fontSize: 18,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  error: {
    color: '#F87171',
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
  hint: {
    color: theme.subtext,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
