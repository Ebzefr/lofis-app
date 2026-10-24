import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Empty, Header, Press, Stepper, T } from '@/components/ui';
import { art, getDish } from '@/data/menu';
import { linePrice, lineSummary, useApp } from '@/store/AppStore';
import { colors, money, radius, shadow } from '@/theme';

export default function Basket() {
  const insets = useSafeAreaInsets();
  const { basket, basketTotals, dispatch } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header
        title="Basket"
        right={
          basket.length ? (
            <Press onPress={() => dispatch({ type: 'clearBasket' })} accessibilityLabel="Empty basket">
              <T w="semibold" size={12} color={colors.yellow}>
                Clear
              </T>
            </Press>
          ) : undefined
        }
      >
        <View style={s.headRow}>
          <T w="bold" size={22} color={colors.white}>
            Your order{'\n'}summary
          </T>
          <View style={s.count}>
            <T w="bold" size={14} color={colors.brown}>
              {basketTotals.count}
            </T>
          </View>
        </View>
      </Header>

      <FlatList
        data={basket}
        keyExtractor={(l) => l.key}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 230, flexGrow: 1 }}
        renderItem={({ item }) => {
          const dish = getDish(item.dishId)!;
          return (
            <Card style={s.line}>
              <Image source={dish.image} style={{ width: 66, height: 66 }} resizeMode="contain" />
              <View style={{ flex: 1, gap: 2 }}>
                <T w="semibold" size={14} numberOfLines={1}>
                  {dish.name}
                </T>
                <T size={11} color={colors.grey} numberOfLines={2}>
                  {lineSummary(item)}
                </T>
                <T w="bold" size={14} color={colors.brown}>
                  {money(linePrice(item) * item.qty)}
                </T>
              </View>
              <Stepper value={item.qty} onChange={(q) => dispatch({ type: 'setQty', key: item.key, qty: q })} />
            </Card>
          );
        }}
        ListFooterComponent={
          basket.length ? (
            <Press onPress={() => router.navigate('/home')} style={s.more} accessibilityLabel="Add more items">
              <Ionicons name="add-circle-outline" size={18} color={colors.brown} />
              <T w="semibold" size={13} color={colors.brown}>
                Add more items
              </T>
            </Press>
          ) : undefined
        }
        ListEmptyComponent={
          <Empty
            image={art.emptyBasket}
            title="Your basket is empty"
            text="Pick a pizza, a burger or something from the wok to get started."
            action={<Button title="Browse the menu" onPress={() => router.navigate('/home')} />}
          />
        }
      />

      {basket.length > 0 && (
        <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Row label="Subtotal" value={money(basketTotals.subtotal)} />
          <Row label="Delivery & service" value={money(basketTotals.fees)} />
          <View style={s.divider} />
          <Row label="Total" value={money(basketTotals.total)} bold />
          <Button
            title="Go to checkout"
            onPress={() => router.push('/checkout')}
            style={{ marginTop: 10 }}
            right={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          />
        </View>
      )}
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <T w={bold ? 'bold' : 'regular'} size={bold ? 16 : 13} color={bold ? colors.ink : colors.grey}>
        {label}
      </T>
      <T w={bold ? 'bold' : 'semibold'} size={bold ? 16 : 13} color={bold ? colors.brown : colors.ink}>
        {value}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  count: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 6,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow(3),
  },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
});
