import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { dietLabels, type Dish } from '@/data/menu';
import { colors, money, radius, shadow } from '@/theme';
import { Heart, Press, T, Tag } from './ui';

const open = (d: Dish) => router.push({ pathname: '/dish/[id]', params: { id: d.id } });

export const dietTag = (d: Dish) =>
  d.diets.includes('vegan')
    ? { text: 'Vegan', tone: 'green' as const }
    : d.diets.includes('vegetarian')
      ? { text: 'Vegetarian', tone: 'green' as const }
      : d.diets.includes('spicy')
        ? { text: 'Spicy', tone: 'red' as const }
        : {
            text: d.category === 'chinese' ? 'Wok' : 'Non-veg',
            tone: 'brown' as const,
          };

/** Square card used in grids ("Popular today", search results). */
export function DishCard({ dish }: { dish: Dish }) {
  const tag = dietTag(dish);
  return (
    <View>
      <Press onPress={() => open(dish)} style={s.card} accessibilityLabel={`${dish.name}, ${money(dish.price)}`}>
        <Image source={dish.image} style={s.img} resizeMode="contain" />
        <Tag text={tag.text} tone={tag.tone} />
        <T w="semibold" size={14} numberOfLines={1} style={{ marginTop: 4 }}>
          {dish.name}
        </T>
        <View style={s.row}>
          <T w="bold" size={14} color={colors.brown}>
            {money(dish.price)}
          </T>
          <View style={s.add}>
            <Ionicons name="add" size={18} color={colors.brown} />
          </View>
        </View>
      </Press>
      {/* sibling, not child, of the card button: a button can't sit inside another button */}
      <View style={s.heart}>
        <Heart id={dish.id} size={30} />
      </View>
    </View>
  );
}

/** Horizontal row used in the wishlist and search list view. */
export function DishRow({ dish, right }: { dish: Dish; right?: React.ReactNode }) {
  const tag = dietTag(dish);
  return (
    <View style={s.rowCard}>
      <Press onPress={() => open(dish)} style={s.rowMain} accessibilityLabel={dish.name}>
        <Image source={dish.image} style={s.rowImg} resizeMode="contain" />
        <View style={{ flex: 1, gap: 2 }}>
          <Tag text={tag.text} tone={tag.tone} />
          <T w="semibold" size={15} numberOfLines={1}>
            {dish.name}
          </T>
          <T size={12} color={colors.grey} numberOfLines={1}>
            {dish.diets.length ? dish.diets.map((d) => dietLabels[d]).join(' · ') : dish.blurb}
          </T>
          <T w="bold" size={14} color={colors.brown}>
            {money(dish.price)}
          </T>
        </View>
      </Press>
      {/* extra buttons sit beside the row button, not inside it */}
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    paddingTop: 10,
    ...shadow(1),
  },
  heart: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  img: { width: '100%', height: 118, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  add: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    ...shadow(1),
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowImg: { width: 78, height: 78 },
});
