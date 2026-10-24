import { router } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, T } from '@/components/ui';
import { art } from '@/data/menu';
import { useApp } from '@/store/AppStore';
import { colors, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useApp();
  const float = useAnimatedValue(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: useNative }),
        Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: useNative }),
      ])
    ).start();
  }, [float]);

  const go = (mode: 'register' | 'login') => {
    dispatch({ type: 'onboarded' });
    router.push({ pathname: '/auth', params: { mode } });
  };

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 }]}>
      <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
        <Image source={art.welcome} style={s.art} resizeMode="contain" />
      </Animated.View>

      <View style={{ alignItems: 'center', gap: 8 }}>
        <T w="bold" size={28}>
          Welcome to Lofi&apos;s
        </T>
        <T size={14} color={colors.grey} style={{ textAlign: 'center', maxWidth: 280, lineHeight: 21 }}>
          Pizza, burgers and Chinese favourites, delivered hot. Or book a table and eat in.
        </T>
      </View>

      <View style={{ gap: 12, alignSelf: 'stretch' }}>
        <Button title="Create account" onPress={() => go('register')} />
        <Button title="Log in" variant="yellow" onPress={() => go('login')} />
        <T size={11} color={colors.grey} style={{ textAlign: 'center', marginTop: 4 }}>
          By continuing you agree to our{' '}
          <T size={11} color={colors.brown} w="semibold">
            Terms
          </T>{' '}
          and{' '}
          <T size={11} color={colors.brown} w="semibold">
            Privacy Policy
          </T>
          .
        </T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28 },
  art: { width: 300, height: 240 },
});
