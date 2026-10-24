import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DishRow } from '@/components/DishCard';
import { BasketButton, Button, Empty, Press, T } from '@/components/ui';
import { art, dishes } from '@/data/menu';
import { uid, useApp } from '@/store/AppStore';
import { colors, radius } from '@/theme';

export default function Wishlist() {
  const insets = useSafeAreaInsets();
  const { wishlist, dispatch } = useApp();
  const [sort, setSort] = useState<'recent' | 'price'>('recent');
  const [added, setAdded] = useState<string | null>(null);

  const items = useMemo(() => {
    const list = wishlist.map((id) => dishes.find((d) => d.id === id)!).filter(Boolean);
    return sort === 'price' ? [...list].sort((a, b) => a.price - b.price) : list;
  }, [wishlist, sort]);

  const quickAdd = (id: string, category: string) => {
    dispatch({
      type: 'addLine',
      line: {
        key: uid(),
        dishId: id,
        size: category === 'pizza' ? '12' : 'regular',
        crust: category === 'pizza' ? 'classic' : undefined,
        extras: [],
        drinks: [],
        qty: 1,
      },
    });
    setAdded(id);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <View style={s.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T w="bold" size={24} color={colors.white}>
              Wishlist
            </T>
            <View style={s.count}>
              <T w="bold" size={12} color={colors.brown}>
                {wishlist.length}
              </T>
            </View>
          </View>
          <BasketButton />
        </View>
        <Press onPress={() => setSort(sort === 'recent' ? 'price' : 'recent')} style={s.sort} accessibilityLabel="Change sort order">
          <T size={12} color="rgba(255,255,255,0.8)">
            Sort by:{' '}
            <T w="semibold" size={12} color={colors.white}>
              {sort === 'recent' ? 'Recently saved' : 'Price'}
            </T>
          </T>
          <Ionicons name="swap-vertical" size={14} color={colors.white} />
        </Press>
      </View>

      <FlatList
        data={items}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 120, flexGrow: 1 }}
        renderItem={({ item }) => (
          <DishRow
            dish={item}
            right={
              <View style={{ gap: 8 }}>
                <Press
                  onPress={() => dispatch({ type: 'toggleWish', id: item.id })}
                  style={s.small}
                  accessibilityLabel={`Remove ${item.name}`}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.grey} />
                </Press>
                <Press
                  onPress={() => quickAdd(item.id, item.category)}
                  style={[s.small, { backgroundColor: colors.brown }]}
                  accessibilityLabel={`Add ${item.name} to basket`}
                >
                  <Ionicons name={added === item.id ? 'checkmark' : 'add'} size={18} color={colors.white} />
                </Press>
              </View>
            }
          />
        )}
        ListEmptyComponent={
          <Empty
            image={art.emptyWishlist}
            title="No favourites yet"
            text="Tap the heart on any dish to save it here for later."
            action={<Button title="Browse the menu" onPress={() => router.navigate('/home')} />}
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: colors.brown,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start' },
  small: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
});
