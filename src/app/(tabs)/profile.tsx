import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Press, T } from '@/components/ui';
import { getDish } from '@/data/menu';
import { orderStage, useApp } from '@/store/AppStore';
import { colors, money, radius } from '@/theme';

const stageText = { cooking: 'Being cooked', 'on-the-way': 'On the way', delivered: 'Delivered', ready: 'Ready to collect' };

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, address, orders, bookings, wishlist, dispatch } = useApp();
  const [now] = useState(Date.now);
  const initials = (user?.name ?? 'L')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ paddingBottom: 130 }}>
      <View style={[s.header, { paddingTop: insets.top + 24 }]}>
        <View style={s.avatar}>
          <T w="bold" size={26} color={colors.brown}>
            {initials}
          </T>
        </View>
        <T w="bold" size={20} color={colors.white} style={{ marginTop: 10 }}>
          {user?.name}
        </T>
        <T size={12} color="rgba(255,255,255,0.75)">
          {user?.email}
        </T>
        <View style={s.stats}>
          {[
            [orders.length, 'Orders'],
            [bookings.length, 'Bookings'],
            [wishlist.length, 'Favourites'],
          ].map(([n, l]) => (
            <View key={l} style={{ alignItems: 'center', flex: 1 }}>
              <T w="bold" size={18} color={colors.yellow}>
                {n}
              </T>
              <T size={11} color="rgba(255,255,255,0.75)">
                {l}
              </T>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: 20, gap: 14 }}>
        <T w="bold" size={16}>
          Your orders
        </T>
        {orders.length === 0 && (
          <T size={13} color={colors.grey}>
            No orders yet. Your first one will show here.
          </T>
        )}
        {orders.map((o) => {
          const st = orderStage(o, now).stage;
          const first = getDish(o.lines[0]?.dishId ?? '');
          return (
            <Press
              key={o.id}
              onPress={() => router.push({ pathname: '/tracking', params: { id: o.id } })}
              accessibilityLabel={`Order ${o.id}`}
            >
              <Card style={s.row}>
                <View style={s.icon}>
                  <Ionicons
                    name={st === 'delivered' || st === 'ready' ? 'checkmark-done' : 'time-outline'}
                    size={20}
                    color={colors.brown}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <T w="semibold" size={14} numberOfLines={1}>
                    {first?.name}
                    {o.lines.length > 1 ? ` + ${o.lines.length - 1} more` : ''}
                  </T>
                  <T size={12} color={colors.grey}>
                    {new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {stageText[st]}
                  </T>
                </View>
                <T w="bold" size={14} color={colors.brown}>
                  {money(o.total)}
                </T>
              </Card>
            </Press>
          );
        })}

        <T w="bold" size={16} style={{ marginTop: 6 }}>
          Table bookings
        </T>
        {bookings.length === 0 && (
          <Press onPress={() => router.push('/reserve')} accessibilityLabel="Book a table">
            <T size={13} color={colors.brown} w="semibold">
              Book your first table →
            </T>
          </Press>
        )}
        {bookings.map((b) => (
          <Card key={b.id} style={s.row}>
            <View style={s.icon}>
              <Ionicons name="calendar-outline" size={20} color={colors.brown} />
            </View>
            <View style={{ flex: 1 }}>
              <T w="semibold" size={14}>
                {new Date(b.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {b.time}
              </T>
              <T size={12} color={colors.grey}>
                Table for {b.guests}
              </T>
            </View>
          </Card>
        ))}

        <T w="bold" size={16} style={{ marginTop: 6 }}>
          Delivery address
        </T>
        <Card style={s.row}>
          <View style={s.icon}>
            <Ionicons name="location-outline" size={20} color={colors.brown} />
          </View>
          <T size={13} style={{ flex: 1 }}>
            {address}
          </T>
        </Card>

        <Button
          title="Log out"
          variant="ghost"
          icon="log-out-outline"
          style={{ marginTop: 12 }}
          onPress={() => (dispatch({ type: 'signOut' }), router.replace('/auth'))}
        />
        <Press
          onPress={() => (dispatch({ type: 'reset' }), router.replace('/welcome'))}
          style={{ alignSelf: 'center', padding: 8 }}
          accessibilityLabel="Reset demo"
        >
          <T size={12} color={colors.grey}>
            Reset demo data
          </T>
        </Press>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.brown,
    alignItems: 'center',
    paddingBottom: 22,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 18, paddingHorizontal: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' },
});
