import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { overlay } from '@/store/overlay';
import { colors, radius, useNative } from '@/theme';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';

/*
 * Bottom sheet drawn inside the screen (not a native Modal), so on the web
 * preview it stays inside the phone frame.
 */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const a = useAnimatedValue(0);
  const [mounted, setMounted] = useState(open);
  // mount as soon as it opens; unmount after the closing animation
  if (open && !mounted) setMounted(true);

  // tell the tab bar to hide while this sheet is open
  useEffect(() => {
    if (!open) return;
    overlay.push();
    return () => overlay.pop();
  }, [open]);

  useEffect(() => {
    Animated.timing(a, { toValue: open ? 1 : 0, duration: 260, useNativeDriver: useNative }).start(() => !open && setMounted(false));
  }, [open, a]);

  if (!mounted) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(34,20,5,0.45)', opacity: a }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={[
          s.sheet,
          { paddingBottom: insets.bottom + 24, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [420, 0] }) }] },
        ]}
      >
        <View style={s.grab} />
        {children}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    gap: 14,
  },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 4 },
});
