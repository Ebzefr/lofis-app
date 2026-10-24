import { router } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { T } from '@/components/ui';
import { art } from '@/data/menu';
import { useApp } from '@/store/AppStore';
import { colors, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

/** Splash: the pan drops in and wobbles, then we route to the right place. */
export default function Splash() {
  const { ready, user, onboarded } = useApp();
  const drop = useAnimatedValue(0);
  const tag = useAnimatedValue(0);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(drop, { toValue: 1, useNativeDriver: useNative, bounciness: 14, speed: 6 }),
      Animated.timing(tag, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: useNative }),
    ]).start();
  }, [drop, tag]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => router.replace(user ? '/home' : onboarded ? '/auth' : '/welcome'), 1700);
    return () => clearTimeout(t);
  }, [ready, user, onboarded]);

  return (
    <View style={s.wrap}>
      <Animated.Image
        source={art.logo}
        resizeMode="contain"
        style={[
          s.logo,
          {
            opacity: drop,
            transform: [
              { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-120, 0] }) },
              { rotate: drop.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] }) },
            ],
          },
        ]}
      />
      <Animated.View style={{ opacity: tag, transform: [{ translateY: tag.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
        <T w="semibold" size={14} color={colors.brown} style={{ letterSpacing: 2, textTransform: 'uppercase' }}>
          Pizza · Burgers · Chinese
        </T>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', gap: 18 },
  logo: { width: 220, height: 210 },
});
