import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeliveryMap } from '@/components/DeliveryMap';
import { Button, Card, Header, Press, T } from '@/components/ui';
import { art, getDish } from '@/data/menu';
import { DEMO, lineSummary, orderStage, uid, useApp } from '@/store/AppStore';
import { colors, money, radius, shadow, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

const STAGES = [
  { id: 'placed', label: 'Placed', icon: 'receipt-outline' },
  { id: 'cooking', label: 'Cooking', icon: 'flame-outline' },
  { id: 'on-the-way', label: 'On the way', icon: 'bicycle-outline' },
  { id: 'delivered', label: 'Delivered', icon: 'home-outline' },
] as const;

export default function Tracking() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, dispatch } = useApp();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const [now, setNow] = useState(Date.now);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  // gentle bob for the cooking illustration
  const bob = useAnimatedValue(0);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
      ])
    ).start();
  }, [bob]);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Header title="Order" />
        <View style={{ padding: 24 }}>
          <T>No order found.</T>
        </View>
      </View>
    );
  }

  const { stage, progress } = orderStage(order, now);
  const collect = order.mode === 'collect';
  const stages = collect
    ? STAGES.filter((x) => x.id !== 'on-the-way').map((x) => (x.id === 'delivered' ? { ...x, label: 'Ready' } : x))
    : STAGES;
  const activeIndex = stages.findIndex((x) => x.id === (stage === 'ready' ? 'delivered' : stage));

  const cookLeft = Math.ceil(DEMO.displayCookMinutes * (1 - progress));
  const rideLeft = Math.max(1, Math.ceil(DEMO.displayRideMinutes * (1 - progress)));

  const reorder = () => {
    order.lines.forEach((l) => dispatch({ type: 'addLine', line: { ...l, key: uid() } }));
    router.push('/basket');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title={`Order #${order.id}`} right={<View style={{ width: 36 }} />}>
        {/* stage tracker */}
        <View style={s.track}>
          {stages.map((st, i) => {
            const on = i <= activeIndex;
            return (
              <View key={st.id} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={[s.trackDot, on && s.trackDotOn]}>
                  <Ionicons name={st.icon} size={15} color={on ? colors.brown : 'rgba(255,255,255,0.6)'} />
                </View>
                <T w={i === activeIndex ? 'semibold' : 'regular'} size={10} color={on ? colors.white : 'rgba(255,255,255,0.6)'}>
                  {st.label}
                </T>
                {i < stages.length - 1 && <View style={[s.trackLine, i < activeIndex && { backgroundColor: colors.yellow }]} />}
              </View>
            );
          })}
        </View>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 40 }}>
        {stage === 'cooking' && (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 10 }}>
            <T w="bold" size={22} color={colors.brown} style={{ textAlign: 'center' }}>
              We&apos;re cooking it…
            </T>
            <T size={13} color={colors.grey}>
              Fresh to order, please wait
            </T>
            <Animated.Image
              source={art.cooking}
              resizeMode="contain"
              style={{
                width: 200,
                height: 160,
                transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
              }}
            />
            <View style={s.countdown}>
              <T w="black" size={46} color={colors.white} style={{ lineHeight: 52 }}>
                {cookLeft}
              </T>
              <T w="semibold" size={12} color={colors.yellow}>
                MIN
              </T>
            </View>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}

        {stage === 'on-the-way' && (
          <>
            <View style={s.mapCard}>
              <DeliveryMap progress={progress} />
              <View style={s.etaBubble}>
                <T w="semibold" size={11} color={colors.grey}>
                  Arriving in
                </T>
                <T w="bold" size={20} color={colors.brown}>
                  {rideLeft} min
                </T>
              </View>
            </View>
            <Card style={s.rider}>
              <Image source={art.rider} style={{ width: 54, height: 54 }} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <T w="semibold" size={15}>
                  Jordan is on the way
                </T>
                <T size={12} color={colors.grey}>
                  Your rider · Yellow moped
                </T>
              </View>
              <Press style={s.call} accessibilityLabel="Message rider">
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.brown} />
              </Press>
              <Press style={[s.call, { backgroundColor: colors.brown }]} accessibilityLabel="Call rider">
                <Ionicons name="call" size={17} color={colors.white} />
              </Press>
            </Card>
          </>
        )}

        {(stage === 'delivered' || stage === 'ready') && (
          <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
            <View style={s.tick}>
              <Ionicons name={collect ? 'bag-check' : 'checkmark'} size={40} color={colors.white} />
            </View>
            <T w="bold" size={22} style={{ textAlign: 'center' }}>
              {collect ? 'Ready to collect!' : 'Delivered. Enjoy!'}
            </T>
            <T size={13} color={colors.grey} style={{ textAlign: 'center', maxWidth: 270 }}>
              {collect ? 'Your order is waiting at the counter on Bold St.' : 'How was it? Your rating helps the kitchen.'}
            </T>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Press key={n} onPress={() => setRating(n)} accessibilityLabel={`Rate ${n} stars`}>
                  <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={30} color={colors.yellow} />
                </Press>
              ))}
            </View>
            {rating > 0 && (
              <T w="semibold" size={12} color={colors.brown}>
                Thanks for rating!
              </T>
            )}
          </View>
        )}

        {/* order details */}
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name={collect ? 'storefront-outline' : 'map-marker-outline'} size={18} color={colors.brown} />
            <T size={13} style={{ flex: 1 }} numberOfLines={1}>
              {order.address}
            </T>
          </View>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          {order.lines.map((l) => {
            const d = getDish(l.dishId)!;
            return (
              <View key={l.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={d.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <T w="semibold" size={13}>
                    {l.qty} × {d.name}
                  </T>
                  <T size={11} color={colors.grey} numberOfLines={1}>
                    {lineSummary(l)}
                  </T>
                </View>
              </View>
            );
          })}
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T w="semibold" size={14}>
              Total paid
            </T>
            <T w="bold" size={14} color={colors.brown}>
              {money(order.total)}
            </T>
          </View>
        </Card>

        {(stage === 'delivered' || stage === 'ready') && <Button title="Order this again" onPress={reorder} icon="refresh" />}
        <Button title="Back to menu" variant="ghost" onPress={() => router.replace('/home')} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  track: { flexDirection: 'row', marginTop: 18 },
  trackDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  trackDotOn: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  trackLine: { position: 'absolute', top: 15, left: '62%', right: '-38%', height: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  countdown: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(2),
  },
  bar: { alignSelf: 'stretch', height: 8, borderRadius: 4, backgroundColor: colors.line, marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.yellow },
  mapCard: { borderRadius: radius.lg, overflow: 'hidden', ...shadow(2) },
  etaBubble: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadow(2),
  },
  rider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  call: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
});
