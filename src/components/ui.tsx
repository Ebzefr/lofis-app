import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps, type ReactNode } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppStore';
import { colors, fonts, radius, shadow, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/* ---------------- Text ---------------- */

type Weight = keyof typeof fonts;
export function T({
  w = 'regular',
  size = 14,
  color = colors.ink,
  style,
  ...p
}: TextProps & { w?: Weight; size?: number; color?: string }) {
  return <Text {...p} style={[{ fontFamily: fonts[w], fontSize: size, color }, style]} />;
}

/* ---------------- Press feedback ---------------- */

/** Pressable that squashes slightly when pressed, like clicking a brick. */
export function Press({
  children,
  onPress,
  style,
  disabled,
  accessibilityLabel,
  hitSlop,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  hitSlop?: number;
}) {
  const scale = useAnimatedValue(1);
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: useNative, speed: 40, bounciness: 8 }).start();
  // Layout styles (flex, width, margins, position) belong on the outer pressable so it
  // can stretch or be placed; everything visual stays on the inner animated view.
  const { outer, inner } = splitStyle(style);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.95)}
      onPressOut={() => to(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlop}
      style={outer}
    >
      <Animated.View style={[inner, { transform: [{ scale }] }, disabled && { opacity: 0.45 }]}>{children}</Animated.View>
    </Pressable>
  );
}

const OUTER_KEYS = [
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'width',
  'minWidth',
  'maxWidth',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'zIndex',
] as const;

function splitStyle(style: StyleProp<ViewStyle>) {
  const flat = { ...(StyleSheet.flatten(style) ?? {}) } as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  for (const k of OUTER_KEYS) {
    if (k in flat) {
      outer[k] = flat[k];
      delete flat[k];
    }
  }
  // let the inner view fill the outer one when the outer is sized
  if (outer.flex !== undefined || outer.width !== undefined || outer.alignSelf === 'stretch') flat.flexGrow = 1;
  return { outer: outer as ViewStyle, inner: flat as ViewStyle };
}

/* ---------------- Buttons ---------------- */

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  right,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'yellow' | 'ghost' | 'light';
  icon?: IconName;
  right?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = btn[variant];
  return (
    <Press onPress={onPress} disabled={disabled} style={[s.btn, v.box, style]} accessibilityLabel={title}>
      {icon && <Ionicons name={icon} size={18} color={v.fg} />}
      <T w="semibold" size={15} color={v.fg}>
        {title}
      </T>
      {right}
    </Press>
  );
}

const btn = {
  primary: { box: { backgroundColor: colors.brown }, fg: colors.white },
  yellow: { box: { backgroundColor: colors.yellow }, fg: colors.brown },
  ghost: { box: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.brown }, fg: colors.brown },
  light: { box: { backgroundColor: colors.white }, fg: colors.brown },
};

export function IconButton({
  name,
  onPress,
  tone = 'light',
  size = 40,
  label,
  badge,
}: {
  name: IconName;
  onPress?: () => void;
  tone?: 'light' | 'brown' | 'yellow' | 'glass';
  size?: number;
  label: string;
  badge?: number;
}) {
  const bg = { light: colors.white, brown: colors.brown, yellow: colors.yellow, glass: 'rgba(255,255,255,0.18)' }[tone];
  const fg = tone === 'brown' || tone === 'glass' ? colors.white : colors.brown;
  return (
    <Press onPress={onPress} accessibilityLabel={label} style={[s.iconBtn, { width: size, height: size, backgroundColor: bg }]}>
      <Ionicons name={name} size={size * 0.48} color={fg} />
      {!!badge && (
        <View style={s.badge}>
          <T w="bold" size={10} color={colors.brown}>
            {badge}
          </T>
        </View>
      )}
    </Press>
  );
}

export function BasketButton({ tone = 'glass' }: { tone?: 'light' | 'glass' }) {
  const { basketTotals } = useApp();
  return (
    <IconButton
      name="bag-handle-outline"
      tone={tone}
      label="Open basket"
      badge={basketTotals.count}
      onPress={() => router.push('/basket')}
    />
  );
}

/* ---------------- Chips, tags, steppers ---------------- */

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: MciName }) {
  return (
    <Press onPress={onPress} style={[s.chip, active && s.chipOn]} accessibilityLabel={label}>
      {icon && <MaterialCommunityIcons name={icon} size={16} color={active ? colors.white : colors.brown} />}
      <T w={active ? 'semibold' : 'medium'} size={13} color={active ? colors.white : colors.inkSoft}>
        {label}
      </T>
    </Press>
  );
}

export function PricePill({ value, style }: { value: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.price, style]}>
      <T w="bold" size={13} color={colors.brown}>
        {value}
      </T>
    </View>
  );
}

export function Tag({ text, tone = 'brown' }: { text: string; tone?: 'brown' | 'green' | 'red' }) {
  const c = { brown: colors.brownSoft, green: colors.green, red: colors.red }[tone];
  return (
    <View style={s.tag}>
      <View style={[s.dot, { backgroundColor: c }]} />
      <T w="semibold" size={10} color={c} style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>
        {text}
      </T>
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  dark,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  dark?: boolean;
}) {
  const fg = dark ? colors.white : colors.brown;
  return (
    <View style={[s.stepper, dark && { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
      <Press onPress={() => onChange(Math.max(min, value - 1))} style={s.stepBtn} accessibilityLabel="Decrease">
        <Ionicons name={value <= 1 && min === 0 ? 'trash-outline' : 'remove'} size={16} color={fg} />
      </Press>
      <T w="bold" size={15} color={fg} style={{ minWidth: 22, textAlign: 'center' }}>
        {value}
      </T>
      <Press onPress={() => onChange(value + 1)} style={[s.stepBtn, { backgroundColor: colors.yellow }]} accessibilityLabel="Increase">
        <Ionicons name="add" size={16} color={colors.brown} />
      </Press>
    </View>
  );
}

export function Heart({ id, size = 34 }: { id: string; size?: number }) {
  const { isWished, dispatch } = useApp();
  const on = isWished(id);
  const pop = useAnimatedValue(1);
  const toggle = () => {
    dispatch({ type: 'toggleWish', id });
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, useNativeDriver: useNative, bounciness: 18 }).start();
  };
  return (
    <Pressable onPress={toggle} hitSlop={8} accessibilityRole="button" accessibilityLabel={on ? 'Remove from wishlist' : 'Add to wishlist'}>
      <Animated.View style={[s.heart, { width: size, height: size, transform: [{ scale: pop }] }]}>
        <Ionicons name={on ? 'heart' : 'heart-outline'} size={size * 0.52} color={on ? colors.red : colors.grey} />
      </Animated.View>
    </Pressable>
  );
}

/* ---------------- Layout ---------------- */

/** Brown header band with rounded bottom corners (the reference's red header). */
export function Header({
  title,
  back = true,
  right,
  children,
  big,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
  big?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top + 12 }, big && { paddingBottom: 28 }]}>
      <View style={s.headerRow}>
        {back ? (
          <IconButton
            name="chevron-back"
            tone="glass"
            size={36}
            label="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        ) : (
          <View style={{ width: 36 }} />
        )}
        {title ? (
          <T w="semibold" size={15} color={colors.white}>
            {title}
          </T>
        ) : (
          <View />
        )}
        {right ?? <View style={{ width: 36 }} />}
      </View>
      {children}
    </View>
  );
}

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flex: 1, backgroundColor: colors.cream }, style]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Empty({ image, title, text, action }: { image: ImageSourcePropType; title: string; text: string; action?: ReactNode }) {
  return (
    <View style={s.empty}>
      <Image source={image} style={{ width: 150, height: 150 }} resizeMode="contain" />
      <T w="bold" size={18} style={{ marginTop: 14 }}>
        {title}
      </T>
      <T size={13} color={colors.grey} style={{ textAlign: 'center', marginTop: 6, maxWidth: 260 }}>
        {text}
      </T>
      {action && <View style={{ marginTop: 20, alignSelf: 'stretch' }}>{action}</View>}
    </View>
  );
}

export function Row({ children, style, gap = 10 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export const textInput: TextStyle = {
  fontFamily: fonts.regular,
  fontSize: 14,
  color: colors.ink,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: radius.md,
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const s = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
  },
  iconBtn: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brown,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.brown, borderColor: colors.brown },
  price: { backgroundColor: colors.yellow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cream, borderRadius: radius.pill, padding: 4 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heart: { borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow(1) },
  header: {
    backgroundColor: colors.brown,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, ...shadow(1) },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
