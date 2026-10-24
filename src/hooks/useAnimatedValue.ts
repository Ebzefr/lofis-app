import { useState } from 'react';
import { Animated } from 'react-native';

/**
 * One Animated.Value per component, created once.
 * (react-native ships its own useAnimatedValue, but react-native-web doesn't.)
 */
export function useAnimatedValue(initial: number) {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}
