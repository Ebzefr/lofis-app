import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DishCard } from '@/components/DishCard';
import { Sheet } from '@/components/Sheet';
import { BasketButton, Button, Chip, Press, T, textInput, type MciName } from '@/components/ui';
import { categories, dishes, getDish, type Category } from '@/data/menu';
import { useApp } from '@/store/AppStore';
import { colors, radius, shadow, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

const promos = [
  { id: 'pizza-pepperoni', title: 'Pizza Friday', text: '2 large pizzas for £20', bg: colors.yellow, fg: colors.brown },
  { id: 'burger-double-smash', title: 'Smash Week', text: 'Double Smash + drink £11', bg: colors.brown, fg: colors.white },
  { id: 'chinese-crispy-chilli-beef', title: 'Wok This Way', text: 'Free spring rolls over £25', bg: '#F3E3C4', fg: colors.brown },
];

const catIcon: Record<Category, MciName> = { pizza: 'pizza', burger: 'hamburger', chinese: 'noodles' };

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user, address, dispatch, orders } = useApp();
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [editAddress, setEditAddress] = useState(false);
  const [draft, setDraft] = useState(address);
  const scrollX = useAnimatedValue(0);
  const [bannerW, setBannerW] = useState(300);

  const list = useMemo(() => {
    const pool = cat === 'all' ? dishes.filter((d) => d.popular) : dishes.filter((d) => d.category === cat);
    return pool;
  }, [cat]);

  const lastOrder = orders[0];
  const first = user?.name.split(' ')[0] ?? 'there';

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={[s.header, { paddingTop: insets.top + 14 }]}>
          <View style={s.headRow}>
            <Press
              onPress={() => (setDraft(address), setEditAddress(true))}
              style={{ flex: 1 }}
              accessibilityLabel="Change delivery address"
            >
              <T size={11} color={colors.yellow} w="medium">
                Deliver to
              </T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="location" size={15} color={colors.yellow} />
                <T w="semibold" size={14} color={colors.white} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {address}
                </T>
                <Ionicons name="chevron-down" size={14} color={colors.white} />
              </View>
            </Press>
            <BasketButton />
          </View>

          <T w="bold" size={24} color={colors.white} style={{ marginTop: 18 }}>
            Hi {first}, hungry?
          </T>
          <T size={13} color="rgba(255,255,255,0.75)">
            Pizza, burgers and Chinese, hot to your door.
          </T>

          <Press onPress={() => router.navigate('/search')} style={s.search} accessibilityLabel="Search the menu">
            <Ionicons name="search" size={18} color={colors.grey} />
            <T size={13} color={colors.grey} style={{ flex: 1 }}>
              Search pizza, burgers, noodles…
            </T>
            <View style={s.filterBtn}>
              <Ionicons name="options-outline" size={16} color={colors.brown} />
            </View>
          </Press>
        </View>

        {/* promos */}
        <View
          style={{ marginTop: 18 }}
          onLayout={(e) => {
            // hidden screens can report a zero width; keep the last real one
            const w = e.nativeEvent.layout.width - 40;
            if (w > 120) setBannerW(w);
          }}
        >
          <Animated.ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={bannerW + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: useNative })}
            scrollEventThrottle={16}
          >
            {promos.map((p) => {
              const d = getDish(p.id)!;
              return (
                <Press
                  key={p.id}
                  onPress={() => router.push({ pathname: '/dish/[id]', params: { id: p.id } })}
                  style={[s.promo, { width: bannerW, backgroundColor: p.bg }]}
                  accessibilityLabel={`${p.title}: ${p.text}`}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <T w="semibold" size={11} color={p.fg} style={{ opacity: 0.8, letterSpacing: 1, textTransform: 'uppercase' }}>
                      Offer
                    </T>
                    <T w="black" size={22} color={p.fg} style={{ lineHeight: 26 }}>
                      {p.title}
                    </T>
                    <T size={12} color={p.fg} style={{ opacity: 0.85 }}>
                      {p.text}
                    </T>
                    <View style={[s.promoCta, { backgroundColor: p.fg }]}>
                      <T w="semibold" size={11} color={p.bg}>
                        Order now
                      </T>
                    </View>
                  </View>
                  <Image source={d.image} style={s.promoImg} resizeMode="contain" />
                </Press>
              );
            })}
          </Animated.ScrollView>
          <View style={s.dots}>
            {promos.map((p, i) => (
              <Animated.View
                key={p.id}
                style={[
                  s.dot,
                  {
                    opacity: scrollX.interpolate({
                      inputRange: [(i - 1) * (bannerW + 12), i * (bannerW + 12), (i + 1) * (bannerW + 12)],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 14 }}
        >
          <Chip label="Popular" icon="fire" active={cat === 'all'} onPress={() => setCat('all')} />
          {categories.map((c) => (
            <Chip key={c.id} label={c.label} icon={catIcon[c.id]} active={cat === c.id} onPress={() => setCat(c.id)} />
          ))}
        </ScrollView>

        {/* re-order */}
        {lastOrder && (
          <Press
            onPress={() => router.push({ pathname: '/tracking', params: { id: lastOrder.id } })}
            style={s.track}
            accessibilityLabel="Track your latest order"
          >
            <MaterialCommunityIcons name="moped" size={26} color={colors.brown} />
            <View style={{ flex: 1 }}>
              <T w="semibold" size={14}>
                Your latest order
              </T>
              <T size={12} color={colors.grey}>
                Tap to see where it is
              </T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.brown} />
          </Press>
        )}

        {/* grid */}
        <View style={s.sectionHead}>
          <T w="bold" size={18}>
            {cat === 'all' ? 'Popular today' : categories.find((c) => c.id === cat)?.label}
          </T>
          <Press onPress={() => router.navigate('/search')} accessibilityLabel="See all dishes">
            <T w="semibold" size={13} color={colors.brown}>
              See all
            </T>
          </Press>
        </View>
        <View style={s.grid}>
          {list.map((d) => (
            <View key={d.id} style={s.cell}>
              <DishCard dish={d} />
            </View>
          ))}
        </View>

        {/* book a table */}
        <Press onPress={() => router.push('/reserve')} style={s.book} accessibilityLabel="Book a table">
          <View style={{ flex: 1, gap: 4 }}>
            <T w="bold" size={18} color={colors.white}>
              Eating in?
            </T>
            <T size={12} color="rgba(255,255,255,0.8)">
              Book a table in three taps.
            </T>
          </View>
          <View style={s.bookBtn}>
            <Ionicons name="calendar" size={16} color={colors.brown} />
            <T w="semibold" size={13} color={colors.brown}>
              Book
            </T>
          </View>
        </Press>
      </ScrollView>

      <Sheet open={editAddress} onClose={() => setEditAddress(false)}>
        <T w="bold" size={18}>
          Delivery address
        </T>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          style={textInput}
          placeholder="Street, city, postcode"
          placeholderTextColor={colors.greyLight}
        />
        <Button
          title="Save address"
          disabled={draft.trim().length < 4}
          onPress={() => {
            dispatch({ type: 'setAddress', address: draft.trim() });
            setEditAddress(false);
          }}
        />
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.brown,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingLeft: 16,
    paddingRight: 6,
    height: 48,
    marginTop: 18,
  },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  promo: {
    height: 150,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    overflow: 'hidden',
    ...shadow(1),
  },
  promoImg: { width: 150, height: 150, marginRight: -40 },
  promoCta: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginTop: 6 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brown },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.yellowSoft,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  cell: { width: '50%', padding: 6 },
  book: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.brown,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.yellow,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
});
