import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DishRow } from '@/components/DishCard';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, Empty, Press, T, type MciName } from '@/components/ui';
import { art, categories, dietLabels, dishes, type Category, type Diet } from '@/data/menu';
import { colors, radius, shadow } from '@/theme';

const prices = [
  { id: 1, label: '£', test: (p: number) => p < 8.5 },
  { id: 2, label: '££', test: (p: number) => p >= 8.5 && p < 10.5 },
  { id: 3, label: '£££', test: (p: number) => p >= 10.5 },
];
const sorts = [
  { id: 'popular', label: 'Most popular' },
  { id: 'price', label: 'Price: low to high' },
  { id: 'rating', label: 'Top rated' },
  { id: 'fast', label: 'Fastest' },
] as const;
const catIcon: Record<Category, MciName> = { pizza: 'pizza', burger: 'hamburger', chinese: 'noodles' };

type Filters = { cats: Category[]; diets: Diet[]; price: number | null; sort: (typeof sorts)[number]['id'] };
const none: Filters = { cats: [], diets: [], price: null, sort: 'popular' };

export default function Search() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Filters>(none);
  const [draft, setDraft] = useState<Filters>(none);
  const [open, setOpen] = useState(false);

  const active = filters.cats.length + filters.diets.length + (filters.price ? 1 : 0);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = dishes.filter(
      (d) =>
        (!term || `${d.name} ${d.blurb} ${d.category}`.toLowerCase().includes(term)) &&
        (!filters.cats.length || filters.cats.includes(d.category)) &&
        filters.diets.every((x) => d.diets.includes(x)) &&
        (!filters.price || prices.find((p) => p.id === filters.price)!.test(d.price))
    );
    const by = {
      popular: (a: (typeof r)[0], b: (typeof r)[0]) => b.reviews - a.reviews,
      price: (a: (typeof r)[0], b: (typeof r)[0]) => a.price - b.price,
      rating: (a: (typeof r)[0], b: (typeof r)[0]) => b.rating - a.rating,
      fast: (a: (typeof r)[0], b: (typeof r)[0]) => a.minutes - b.minutes,
    }[filters.sort];
    return [...r].sort(by);
  }, [q, filters]);

  const toggle = <K extends 'cats' | 'diets'>(k: K, v: Filters[K][number]) =>
    setDraft((f) => ({ ...f, [k]: (f[k] as string[]).includes(v) ? (f[k] as string[]).filter((x) => x !== v) : [...f[k], v] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[s.head, { paddingTop: insets.top + 16 }]}>
        <T w="bold" size={24}>
          Find your food
        </T>
        <View style={s.searchRow}>
          <View style={s.search}>
            <Ionicons name="search" size={18} color={colors.grey} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search any dish"
              placeholderTextColor={colors.grey}
              style={s.input}
              returnKeyType="search"
              accessibilityLabel="Search dishes"
            />
            {!!q && (
              <Press onPress={() => setQ('')} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={colors.greyLight} />
              </Press>
            )}
          </View>
          <Press onPress={() => (setDraft(filters), setOpen(true))} style={s.filter} accessibilityLabel="Open filters">
            <Ionicons name="options-outline" size={20} color={colors.white} />
            {active > 0 && (
              <View style={s.badge}>
                <T w="bold" size={9} color={colors.brown}>
                  {active}
                </T>
              </View>
            )}
          </Press>
        </View>

        {/* quick diet filters */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {(['vegan', 'vegetarian', 'gluten-free', 'spicy'] as Diet[]).map((d) => (
            <Chip
              key={d}
              label={dietLabels[d]}
              active={filters.diets.includes(d)}
              onPress={() => setFilters((f) => ({ ...f, diets: f.diets.includes(d) ? f.diets.filter((x) => x !== d) : [...f.diets, d] }))}
            />
          ))}
        </View>
        <T size={12} color={colors.grey} style={{ marginTop: 12 }}>
          {results.length} {results.length === 1 ? 'dish' : 'dishes'} · {sorts.find((x) => x.id === filters.sort)?.label}
        </T>
      </View>

      <FlatList
        data={results}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 20, paddingTop: 6, gap: 12, paddingBottom: 120, flexGrow: 1 }}
        renderItem={({ item }) => <DishRow dish={item} />}
        ListEmptyComponent={
          <Empty
            image={art.emptyBasket}
            title="Nothing matches"
            text="Try removing a filter or searching for something else."
            action={<Button title="Clear filters" variant="ghost" onPress={() => (setFilters(none), setQ(''))} />}
          />
        }
      />

      <Sheet open={open} onClose={() => setOpen(false)}>
        <T w="bold" size={18}>
          Category
        </T>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {categories.map((c) => {
            const on = draft.cats.includes(c.id);
            return (
              <Press key={c.id} onPress={() => toggle('cats', c.id)} style={{ alignItems: 'center', gap: 6 }} accessibilityLabel={c.label}>
                <View style={[s.catCircle, on && { backgroundColor: colors.brown }]}>
                  <MaterialCommunityIcons name={catIcon[c.id]} size={28} color={on ? colors.white : colors.brown} />
                </View>
                <T w="medium" size={12} color={on ? colors.brown : colors.grey}>
                  {c.label}
                </T>
              </Press>
            );
          })}
        </View>

        <T w="bold" size={18}>
          Dietary
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(dietLabels) as Diet[]).map((d) => (
            <Chip key={d} label={dietLabels[d]} active={draft.diets.includes(d)} onPress={() => toggle('diets', d)} />
          ))}
        </View>

        <T w="bold" size={18}>
          Price range
        </T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {prices.map((p) => (
            <Press
              key={p.id}
              onPress={() => setDraft((f) => ({ ...f, price: f.price === p.id ? null : p.id }))}
              style={[s.price, draft.price === p.id && { backgroundColor: colors.brown, borderColor: colors.brown }]}
              accessibilityLabel={`Price ${p.label}`}
            >
              <T w="bold" size={14} color={draft.price === p.id ? colors.white : colors.brown}>
                {p.label}
              </T>
            </Press>
          ))}
        </View>

        <T w="bold" size={18}>
          Sort by
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {sorts.map((x) => (
            <Chip key={x.id} label={x.label} active={draft.sort === x.id} onPress={() => setDraft((f) => ({ ...f, sort: x.id }))} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Button title="Clear" variant="ghost" style={{ flex: 1 }} onPress={() => setDraft(none)} />
          <Button
            title="Apply"
            style={{ flex: 2 }}
            onPress={() => {
              setFilters(draft);
              setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingBottom: 6 },
  searchRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 50,
    ...shadow(1),
  },
  input: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.ink, outlineStyle: 'none' } as object,
  filter: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  price: {
    width: 64,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
