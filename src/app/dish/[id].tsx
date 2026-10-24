import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dietTag } from '@/components/DishCard';
import { Sheet } from '@/components/Sheet';
import { BasketButton, Button, Header, Heart, Press, Stepper, T, Tag } from '@/components/ui';
import { dietLabels, drinks, extrasFor, extrasTitle, getDish, mealSizes, pizzaCrusts, pizzaSizes, type Extra } from '@/data/menu';
import { linePrice, uid, useApp } from '@/store/AppStore';
import { colors, money, radius, shadow, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

type Step = 'size' | 'crust' | 'extras' | 'drink';
const PLATE = 250;

export default function DishScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dish = getDish(id ?? '');
  const insets = useSafeAreaInsets();
  const { dispatch } = useApp();

  const isPizza = dish?.category === 'pizza';
  const sizes = isPizza ? pizzaSizes : mealSizes;
  const steps: Step[] = isPizza ? ['size', 'crust', 'extras', 'drink'] : ['size', 'extras', 'drink'];

  const [step, setStep] = useState<Step>('size');
  const [size, setSize] = useState(sizes[0].id);
  const [crust, setCrust] = useState(pizzaCrusts[0].id);
  const [extras, setExtras] = useState<string[]>([]);
  const [drinkIds, setDrinks] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [info, setInfo] = useState(false);
  const [added, setAdded] = useState(false);

  // plate grows/shrinks and spins a little when the size changes
  const scale = useAnimatedValue(sizes[0].scale);
  const spin = useAnimatedValue(0);
  useEffect(() => {
    const target = sizes.find((x) => x.id === size)?.scale ?? 1;
    Animated.parallel([
      Animated.spring(scale, { toValue: target, useNativeDriver: useNative, bounciness: 10 }),
      Animated.timing(spin, { toValue: Math.random(), duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: useNative }),
    ]).start();
  }, [size, sizes, scale, spin]);

  // the dish "drops in" on open
  const enter = useAnimatedValue(0);
  useEffect(() => {
    Animated.spring(enter, { toValue: 1, useNativeDriver: useNative, bounciness: 9, speed: 7 }).start();
  }, [enter]);

  const unit = useMemo(
    () => (dish ? linePrice({ dishId: dish.id, size, crust: isPizza ? crust : undefined, extras, drinks: drinkIds }) : 0),
    [dish, size, crust, extras, drinkIds, isPizza]
  );

  if (!dish) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <T w="bold">Dish not found</T>
        <Button title="Back to menu" onPress={() => router.replace('/home')} />
      </View>
    );
  }

  const tag = dietTag(dish);
  const extraList = extrasFor(dish.category);
  const picked = [...extras, ...drinkIds].map((x) => [...extraList, ...drinks].find((e) => e.id === x)!).filter(Boolean);
  const title = { pizza: 'Custom Pizza', burger: 'Custom Burger', chinese: 'Your Wok Dish' }[dish.category];
  const stepLabel: Record<Step, string> = {
    size: 'Size',
    crust: 'Crust',
    extras: isPizza ? 'Toppings' : dish.category === 'burger' ? 'Extras' : 'Sides',
    drink: 'Drink',
  };
  const stepIcon: Record<Step, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
    size: 'resize',
    crust: 'circle-double',
    extras: isPizza ? 'mushroom-outline' : dish.category === 'burger' ? 'cheese' : 'food-variant',
    drink: 'cup-outline',
  };
  const stepIndex = steps.indexOf(step);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const add = () => {
    dispatch({
      type: 'addLine',
      line: { key: uid(), dishId: dish.id, size, crust: isPizza ? crust : undefined, extras, drinks: drinkIds, qty },
    });
    setAdded(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title={title} right={<BasketButton />} />

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={s.titleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Tag text={tag.text} tone={tag.tone} />
            <T w="bold" size={24} style={{ lineHeight: 30 }}>
              {dish.name}
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.meta}>
                <Ionicons name="star" size={13} color={colors.yellow} />
                <T w="semibold" size={12}>
                  {dish.rating}
                </T>
                <T size={11} color={colors.grey}>
                  ({dish.reviews})
                </T>
              </View>
              <View style={s.meta}>
                <Ionicons name="time-outline" size={13} color={colors.brownSoft} />
                <T size={12} color={colors.brownSoft}>
                  {dish.minutes} min
                </T>
              </View>
              <Press onPress={() => setInfo(true)} style={s.meta} accessibilityLabel="Ingredients and allergy info">
                <Ionicons name="information-circle-outline" size={14} color={colors.brown} />
                <T w="semibold" size={12} color={colors.brown}>
                  Info
                </T>
              </Press>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={s.bigPrice}>
              <T w="bold" size={15} color={colors.brown}>
                {money(unit)}
              </T>
            </View>
            <Heart id={dish.id} />
          </View>
        </View>

        {/* plate */}
        <View style={s.stage}>
          <View style={s.ring} />
          <View style={[s.ring, s.ringInner]} />
          <Animated.Image
            source={dish.image}
            resizeMode="contain"
            style={{
              width: PLATE,
              height: PLATE,
              opacity: enter,
              transform: [
                { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
                { scale },
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', isPizza || dish.category === 'chinese' ? '140deg' : '0deg'],
                  }),
                },
              ],
            }}
          />
          {/* picked extras orbit the plate */}
          {picked.slice(0, 8).map((e, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(6, picked.length);
            const r = PLATE / 2 + 22;
            return (
              <View key={e.id} style={[s.orbit, { transform: [{ translateX: r * Math.cos(a) }, { translateY: r * Math.sin(a) }] }]}>
                <Image source={e.image} style={{ width: 30, height: 30 }} resizeMode="contain" />
              </View>
            );
          })}
        </View>

        {/* step tabs */}
        <View style={s.stepTabs}>
          {steps.map((st, i) => (
            <Press
              key={st}
              onPress={() => setStep(st)}
              style={[s.stepTab, st === step && s.stepTabOn]}
              accessibilityLabel={`Step ${i + 1}: ${stepLabel[st]}`}
            >
              <MaterialCommunityIcons name={stepIcon[st]} size={18} color={st === step ? colors.white : colors.brown} />
              {st === step && (
                <T w="semibold" size={12} color={colors.white}>
                  {stepLabel[st]}
                </T>
              )}
            </Press>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          {step === 'size' && (
            <>
              <T w="semibold" size={15} style={s.stepTitle}>
                Choose a size
              </T>
              <View style={s.sizeRow}>
                {sizes.map((x) => {
                  const on = x.id === size;
                  return (
                    <Press
                      key={x.id}
                      onPress={() => setSize(x.id)}
                      style={[s.size, on && s.sizeOn]}
                      accessibilityLabel={`${x.name} ${x.label}`}
                    >
                      <T w="bold" size={on ? 18 : 15} color={on ? colors.brown : colors.grey}>
                        {x.label}
                      </T>
                      <T size={10} color={on ? colors.brown : colors.grey}>
                        {x.add ? `+${money(x.add)}` : x.name}
                      </T>
                    </Press>
                  );
                })}
              </View>
              <Hint text={`${sizes.find((x) => x.id === size)?.name} ${isPizza ? 'pizza' : 'portion'} selected`} />
            </>
          )}

          {step === 'crust' && (
            <>
              <T w="semibold" size={15} style={s.stepTitle}>
                Set your crust
              </T>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {pizzaCrusts.map((c) => {
                  const on = c.id === crust;
                  return (
                    <Press key={c.id} onPress={() => setCrust(c.id)} style={[s.crust, on && s.crustOn]} accessibilityLabel={c.name}>
                      <T w="semibold" size={12} color={on ? colors.brown : colors.grey} style={{ textAlign: 'center' }}>
                        {c.name}
                      </T>
                      <T size={11} color={on ? colors.brown : colors.grey}>
                        {c.add ? `+${money(c.add)}` : 'Included'}
                      </T>
                    </Press>
                  );
                })}
              </View>
              <Hint text={`${pizzaCrusts.find((c) => c.id === crust)?.name} crust selected`} />
            </>
          )}

          {step === 'extras' && (
            <ExtraPicker
              title={extrasTitle(dish.category)}
              list={extraList}
              picked={extras}
              onToggle={(v) => toggle(extras, setExtras, v)}
            />
          )}
          {step === 'drink' && (
            <ExtraPicker title="Add a drink" list={drinks} picked={drinkIds} onToggle={(v) => toggle(drinkIds, setDrinks, v)} />
          )}

          {stepIndex < steps.length - 1 && (
            <Press onPress={() => setStep(steps[stepIndex + 1])} style={s.next} accessibilityLabel="Next step">
              <T w="semibold" size={13} color={colors.brown}>
                Next: {stepLabel[steps[stepIndex + 1]]}
              </T>
              <Ionicons name="arrow-forward" size={14} color={colors.brown} />
            </Press>
          )}
        </View>
      </ScrollView>

      {/* bottom bar */}
      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Stepper value={qty} min={1} onChange={setQty} />
        <Button title={`Add to basket · ${money(unit * qty)}`} style={{ flex: 1 }} onPress={add} />
      </View>

      <Sheet open={info} onClose={() => setInfo(false)}>
        <T w="bold" size={18}>
          {dish.name}
        </T>
        <T size={13} style={{ lineHeight: 20 }}>
          {dish.description}
        </T>
        <T w="semibold" size={14}>
          Allergy info
        </T>
        <T size={13} color={colors.inkSoft}>
          {dish.allergens}
        </T>
        {dish.diets.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {dish.diets.map((d) => (
              <View key={d} style={s.diet}>
                <T w="semibold" size={11} color={colors.brown}>
                  {dietLabels[d]}
                </T>
              </View>
            ))}
          </View>
        )}
        <Button title="Got it" variant="yellow" onPress={() => setInfo(false)} />
      </Sheet>

      <Sheet open={added} onClose={() => setAdded(false)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={dish.image} style={{ width: 64, height: 64 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <T w="bold" size={17}>
              Added to your basket
            </T>
            <T size={12} color={colors.grey}>
              {qty} × {dish.name}
            </T>
          </View>
          <Ionicons name="checkmark-circle" size={30} color={colors.green} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Keep browsing" variant="ghost" style={{ flex: 1 }} onPress={() => (setAdded(false), router.back())} />
          <Button title="View basket" style={{ flex: 1 }} onPress={() => (setAdded(false), router.push('/basket'))} />
        </View>
      </Sheet>
    </View>
  );
}

function ExtraPicker({
  title,
  list,
  picked,
  onToggle,
}: {
  title: string;
  list: Extra[];
  picked: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <T w="semibold" size={15} style={s.stepTitle}>
        {title}
      </T>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 6, paddingRight: 20 }}
      >
        {list.map((e) => {
          const on = picked.includes(e.id);
          return (
            <Press
              key={e.id}
              onPress={() => onToggle(e.id)}
              style={{ alignItems: 'center', gap: 4, width: 74 }}
              accessibilityLabel={`${on ? 'Remove' : 'Add'} ${e.name}`}
            >
              <View style={[s.extra, on && s.extraOn]}>
                <Image source={e.image} style={{ width: 46, height: 46 }} resizeMode="contain" />
                {on && (
                  <View style={s.minus}>
                    <Ionicons name="remove" size={12} color={colors.white} />
                  </View>
                )}
              </View>
              <T w="medium" size={11} numberOfLines={1}>
                {e.name}
              </T>
              <T size={10} color={colors.grey}>
                {e.price ? `+${money(e.price)}` : 'Free'}
              </T>
            </Press>
          );
        })}
      </ScrollView>
      <Hint text={picked.length ? `${picked.length} added` : 'Tap to add, tap again to remove'} />
    </>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12 }}>
      <MaterialCommunityIcons name="silverware-fork-knife" size={13} color={colors.brownSoft} />
      <T size={12} color={colors.brownSoft} style={{ fontStyle: 'italic' }}>
        {text}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  titleRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 18, gap: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bigPrice: { backgroundColor: colors.yellow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  stage: { height: PLATE + 70, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ring: {
    position: 'absolute',
    width: PLATE + 44,
    height: PLATE + 44,
    borderRadius: (PLATE + 44) / 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
  ringInner: {
    width: PLATE + 10,
    height: PLATE + 10,
    borderRadius: (PLATE + 10) / 2,
    borderStyle: 'solid',
    backgroundColor: 'rgba(249,207,0,0.08)',
  },
  orbit: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(1),
  },
  stepTabs: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  stepTab: {
    height: 40,
    minWidth: 40,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadow(1),
  },
  stepTabOn: { backgroundColor: colors.brown, paddingHorizontal: 16 },
  stepTitle: { textAlign: 'center', marginBottom: 12 },
  sizeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  size: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  sizeOn: { width: 80, height: 80, borderRadius: 40, borderColor: colors.brown, borderWidth: 2 },
  crust: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    gap: 4,
  },
  crustOn: { borderColor: colors.brown, borderWidth: 2 },
  extra: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  extraOn: { borderColor: colors.brown, borderWidth: 2, backgroundColor: colors.yellowSoft },
  minus: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 16, padding: 8 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow(3),
  },
  diet: { backgroundColor: colors.yellowSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
});
