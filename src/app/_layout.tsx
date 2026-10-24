import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { T } from '@/components/ui';
import { art } from '@/data/menu';
import { AppProvider } from '@/store/AppStore';
import { colors } from '@/theme';

// The app is always laid out at a real phone size, then the whole phone is scaled to fit.
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2;
const INTRO_W = 380;
const GAP = 72;

/** On a desktop browser, show the app inside a phone frame with a short intro beside it. */
function DeviceFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width < 760) return <>{children}</>;

  const showIntro = width >= INTRO_W + GAP + PHONE_W * 0.7 + 96;
  const room = showIntro ? width - INTRO_W - GAP - 96 : width - 48;
  const scale = Math.max(0.55, Math.min(1.12, (height - 40) / PHONE_H, room / PHONE_W));

  return (
    <View style={f.page}>
      {showIntro && (
        <View style={f.intro}>
          <Image source={art.logo} style={{ width: 120, height: 114 }} resizeMode="contain" />
          <T w="black" size={40} color={colors.brown} style={{ lineHeight: 46, marginTop: 18 }}>
            Lofi&apos;s, a working{'\n'}mobile prototype.
          </T>
          <T size={15} color={colors.brownSoft} style={{ marginTop: 14, lineHeight: 24 }}>
            Built with React Native and Expo from my Lofi&apos;s UX case study. Browse the menu, filter by diet, customise your order, check
            out, track delivery on the map and book a table. No backend: everything is saved on your device.
          </T>
          <T w="semibold" size={13} color={colors.brown} style={{ marginTop: 22 }}>
            Best on a phone. Open this page on your mobile.
          </T>
          <Pressable onPress={() => Linking.openURL('https://ebze.dev')} accessibilityRole="link">
            <T w="semibold" size={13} color={colors.brown} style={{ marginTop: 8, textDecorationLine: 'underline' }}>
              ebze.dev
            </T>
          </Pressable>
        </View>
      )}
      {/* outer box takes the scaled size; inner phone keeps its real size and is scaled visually */}
      <View style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
        <View style={[f.phone, { transform: [{ scale }] }]}>
          <View style={f.screen}>{children}</View>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <DeviceFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.cream },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="order-placed" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
          </Stack>
          {/* brand-coloured cover while fonts load */}
          {!fontsLoaded && <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.yellow }]} />}
        </DeviceFrame>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const f = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 72,
    backgroundColor: colors.yellow,
    padding: 24,
  },
  intro: { maxWidth: 380 },
  phone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PHONE_W,
    height: PHONE_H,
    padding: BEZEL,
    borderRadius: 56,
    backgroundColor: '#111',
    transformOrigin: 'top left',
    boxShadow: '0 30px 80px rgba(88,45,9,0.35)',
  } as object,
  screen: { flex: 1, borderRadius: 44, overflow: 'hidden', backgroundColor: colors.cream },
});
