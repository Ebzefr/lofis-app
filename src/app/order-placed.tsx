import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, T } from '@/components/ui';
import { getDish } from '@/data/menu';
import { useApp } from '@/store/AppStore';
import { colors, money, radius, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

/** "Great! Your order's in" celebration, like the reference's red success screen. */
export default function OrderPlaced() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const pop = useAnimatedValue(0);
  const spin = useAnimatedValue(0);

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: useNative, bounciness: 14, speed: 5 }).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: useNative })).start();
  }, [pop, spin]);

  if (!order) return null;
  const main = getDish(order.lines[0].dishId)!;
  const count = order.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <T w="semibold" size={14} color={colors.yellow} style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
          Great!
        </T>
        <T w="bold" size={28} color={colors.white} style={{ textAlign: 'center', lineHeight: 34 }}>
          Your order&apos;s in{'\n'}and on the pan!
        </T>
      </View>

      <View style={s.stage}>
        <Animated.View style={[s.glow, { transform: [{ scale: pop }] }]} />
        <Animated.Image
          source={main.image}
          resizeMode="contain"
          style={{
            width: 230,
            height: 230,
            transform: [
              { scale: pop },
              { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', main.category === 'burger' ? '0deg' : '360deg'] }) },
            ],
          }}
        />
        <View style={s.count}>
          <T w="bold" size={13} color={colors.brown}>
            {count}
          </T>
        </View>
        <View style={s.thumbs}>
          {order.lines.slice(1, 4).map((l) => (
            <View key={l.key} style={s.thumb}>
              <Image source={getDish(l.dishId)!.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
            </View>
          ))}
        </View>
      </View>

      <View style={{ alignSelf: 'stretch', gap: 12 }}>
        <View style={s.summary}>
          <T size={13} color="rgba(255,255,255,0.8)">
            Order #{order.id}
          </T>
          <T w="bold" size={15} color={colors.yellow}>
            {money(order.total)}
          </T>
        </View>
        <Button
          title={order.mode === 'delivery' ? 'Track my delivery' : 'Track my order'}
          variant="yellow"
          onPress={() => router.replace({ pathname: '/tracking', params: { id: order.id } })}
        />
        <Button title="Back to menu" variant="light" onPress={() => router.replace('/home')} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  stage: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(249,207,0,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(249,207,0,0.35)',
  },
  count: {
    position: 'absolute',
    top: 28,
    right: 40,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbs: { position: 'absolute', bottom: 6, flexDirection: 'row', gap: 8 },
  thumb: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
