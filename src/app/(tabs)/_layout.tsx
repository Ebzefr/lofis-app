import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, type IconName } from '@/components/ui';
import { useApp } from '@/store/AppStore';
import { useOverlayOpen } from '@/store/overlay';
import { colors, radius, shadow } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, { on: IconName; off: IconName; label: string }> = {
  home: { on: 'fast-food', off: 'fast-food-outline', label: 'Home' },
  search: { on: 'search', off: 'search-outline', label: 'Search' },
  wishlist: { on: 'heart', off: 'heart-outline', label: 'Wishlist' },
  profile: { on: 'person', off: 'person-outline', label: 'Profile' },
};

function TabButton({ name, focused, onPress, badge }: { name: string; focused: boolean; onPress: () => void; badge?: number }) {
  const a = useAnimatedValue(focused ? 1 : 0);
  useEffect(() => {
    Animated.spring(a, { toValue: focused ? 1 : 0, useNativeDriver: false, bounciness: 8 }).start();
  }, [focused, a]);
  const icon = ICONS[name];
  return (
    <Pressable
      onPress={onPress}
      style={s.btn}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={icon.label}
    >
      <Animated.View
        style={[
          s.bubble,
          {
            backgroundColor: a.interpolate({ inputRange: [0, 1], outputRange: ['rgba(88,45,9,0)', colors.brown] }),
            transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          },
        ]}
      >
        <Ionicons name={focused ? icon.on : icon.off} size={22} color={focused ? colors.white : colors.grey} />
      </Animated.View>
      {!!badge && (
        <View style={s.badge}>
          <T w="bold" size={9} color={colors.brown}>
            {badge}
          </T>
        </View>
      )}
    </Pressable>
  );
}

/** Floating white pill tab bar, like the reference design. */
function TabBar({ state, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { wishlist } = useApp();
  const hidden = useOverlayOpen();
  if (hidden) return null;
  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <View style={s.bar}>
        {state.routes.map((route, i) => (
          <TabButton
            key={route.key}
            name={route.name}
            focused={state.index === i}
            badge={route.name === 'wishlist' ? wishlist.length : undefined}
            onPress={() => state.index !== i && navigateToTab(route.key)}
          />
        ))}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { ready, user } = useApp();
  if (ready && !user) return <Redirect href="/welcome" />;
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.cream } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    padding: 8,
    ...shadow(3),
  },
  btn: { width: 62, height: 48, alignItems: 'center', justifyContent: 'center' },
  bubble: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 2,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
