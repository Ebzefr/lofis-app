import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconButton, T, textInput } from '@/components/ui';
import { colors } from '@/theme';

type Step = 'email' | 'sent' | 'reset' | 'done';

/** Forgot password: email → "check your inbox" → new password → success. */
export default function Forgot() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  const canSend = /^\S+@\S+\.\S+$/.test(email);
  const canReset = pw.length >= 6 && pw === pw2;

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <IconButton
        name="chevron-back"
        tone="light"
        size={38}
        label="Go back"
        onPress={() => (step === 'email' ? router.back() : setStep('email'))}
      />

      {step === 'email' && (
        <View style={s.body}>
          <T w="bold" size={24} color={colors.brown}>
            Forgot password
          </T>
          <T color={colors.grey}>Enter the email you registered with and we&apos;ll send you a reset link.</T>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.greyLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[textInput, { marginTop: 18 }]}
          />
          <View style={{ flex: 1 }} />
          <Button title="Send reset link" disabled={!canSend} onPress={() => setStep('sent')} />
        </View>
      )}

      {step === 'sent' && (
        <Done
          title="Check your inbox"
          text={`We've sent a reset link to ${email}. (Prototype: tap below to pretend you opened it.)`}
          cta="I've opened the link"
          onPress={() => setStep('reset')}
        />
      )}

      {step === 'reset' && (
        <View style={s.body}>
          <T w="bold" size={24} color={colors.brown}>
            Choose a new password
          </T>
          <T color={colors.grey}>At least 6 characters.</T>
          <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder="New password"
            placeholderTextColor={colors.greyLight}
            secureTextEntry
            style={[textInput, { marginTop: 18 }]}
          />
          <TextInput
            value={pw2}
            onChangeText={setPw2}
            placeholder="Confirm password"
            placeholderTextColor={colors.greyLight}
            secureTextEntry
            style={textInput}
          />
          {pw2.length > 0 && pw !== pw2 && (
            <T size={11} color={colors.red}>
              Passwords don&apos;t match
            </T>
          )}
          <View style={{ flex: 1 }} />
          <Button title="Reset password" disabled={!canReset} onPress={() => setStep('done')} />
        </View>
      )}

      {step === 'done' && (
        <Done title="Password changed" text="All set. Log in with your new password." cta="Back to log in" onPress={() => router.back()} />
      )}
    </View>
  );
}

function Done({ title, text, cta, onPress }: { title: string; text: string; cta: string; onPress: () => void }) {
  return (
    <View style={s.body}>
      <View style={s.center}>
        <View style={s.tick}>
          <Ionicons name="checkmark" size={40} color={colors.white} />
        </View>
        <T w="bold" size={24}>
          {title}
        </T>
        <T color={colors.grey} style={{ textAlign: 'center', maxWidth: 280 }}>
          {text}
        </T>
      </View>
      <Button title={cta} onPress={onPress} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 24 },
  body: { flex: 1, gap: 10, marginTop: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tick: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
