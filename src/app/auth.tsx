import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Press, T, textInput } from '@/components/ui';
import { art } from '@/data/menu';
import { useApp } from '@/store/AppStore';
import { colors, radius, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);

/** Create account / Login, as one bottom sheet with two tabs. Any details work: it's a prototype. */
export default function Auth() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { dispatch } = useApp();
  const [mode, setMode] = useState<'register' | 'login'>(params.mode === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);

  const tab = useAnimatedValue(mode === 'register' ? 0 : 1);
  useEffect(() => {
    Animated.spring(tab, { toValue: mode === 'register' ? 0 : 1, useNativeDriver: useNative, bounciness: 6 }).start();
  }, [mode, tab]);

  const errors = {
    name: mode === 'register' && name.trim().length < 2 ? 'Please enter your name' : '',
    email: !emailOk(email) ? 'Enter a valid email address' : '',
    password: password.length < 6 ? 'At least 6 characters' : '',
  };
  const valid = !errors.name && !errors.email && !errors.password;

  const submit = () => {
    setTried(true);
    if (!valid) return;
    const display = mode === 'register' ? name.trim() : email.split('@')[0].replace(/[._]/g, ' ');
    dispatch({ type: 'signIn', user: { name: display.replace(/\b\w/g, (c) => c.toUpperCase()), email } });
    router.replace('/home');
  };

  const google = () => {
    dispatch({ type: 'signIn', user: { name: 'Guest Foodie', email: 'guest@lofis.app' } });
    router.replace('/home');
  };

  const field = (label: string, value: string, set: (v: string) => void, err: string, props: object = {}) => (
    <View style={{ gap: 6 }}>
      <T w="medium" size={13}>
        {label}
      </T>
      <TextInput
        value={value}
        onChangeText={set}
        placeholderTextColor={colors.greyLight}
        style={[textInput, tried && err ? s.bad : null]}
        {...props}
      />
      {tried && !!err && (
        <T size={11} color={colors.red}>
          {err}
        </T>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.yellow }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.top, { paddingTop: insets.top + 8 }]}>
        <Image source={art.welcome} style={{ width: 230, height: 170 }} resizeMode="contain" />
      </View>
      <View style={s.sheet}>
        <View style={s.grabber} />
        <View style={s.tabs}>
          {(['register', 'login'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => (setMode(m), setTried(false))}
              style={s.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
            >
              <T w={mode === m ? 'semibold' : 'medium'} size={16} color={mode === m ? colors.brown : colors.grey}>
                {m === 'register' ? 'Create account' : 'Log in'}
              </T>
            </Pressable>
          ))}
          <Animated.View
            style={[s.underline, { transform: [{ translateX: tab.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) }] }]}
          />
        </View>

        <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
          {mode === 'register' &&
            field('Full name', name, setName, errors.name, { placeholder: 'Enter your full name', autoComplete: 'name' })}
          {field('Email address', email, setEmail, errors.email, {
            placeholder: 'you@example.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
          })}
          <View style={{ gap: 6 }}>
            <T w="medium" size={13}>
              Password
            </T>
            <View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.greyLight}
                secureTextEntry={!show}
                style={[textInput, { paddingRight: 48 }, tried && errors.password ? s.bad : null]}
                onSubmitEditing={submit}
              />
              <Pressable onPress={() => setShow(!show)} style={s.eye} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
                <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.grey} />
              </Pressable>
            </View>
            {tried && !!errors.password && (
              <T size={11} color={colors.red}>
                {errors.password}
              </T>
            )}
          </View>

          {mode === 'login' && (
            <Pressable onPress={() => router.push('/forgot')} style={{ alignSelf: 'flex-end' }}>
              <T w="semibold" size={13} color={colors.brown}>
                Forgot password?
              </T>
            </Pressable>
          )}

          <Button title={mode === 'register' ? 'Create account' : 'Log in'} onPress={submit} style={{ marginTop: 6 }} />
          <Press onPress={google} style={s.google} accessibilityLabel="Continue with Google">
            <Ionicons name="logo-google" size={18} color={colors.brown} />
            <T w="medium" size={14}>
              Continue with Google
            </T>
          </Press>
          <T size={11} color={colors.grey} style={{ textAlign: 'center' }}>
            Prototype: any details will do, nothing is sent anywhere.
          </T>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  top: { alignItems: 'center', paddingBottom: 6 },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 14 },
  tabs: { flexDirection: 'row', marginBottom: 18, width: 300, alignSelf: 'center' },
  tab: { width: 150, alignItems: 'center', paddingVertical: 8 },
  underline: { position: 'absolute', bottom: 0, left: 45, width: 60, height: 3, borderRadius: 2, backgroundColor: colors.brown },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  bad: { borderColor: colors.red },
  google: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
