import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/** Lofi's brand colours (from the original UX case study). */
export const colors = {
  brown: '#582D09',
  brownDark: '#3E1F05',
  brownSoft: '#7A4A22',
  yellow: '#F9CF00',
  yellowSoft: '#FFF1B8',
  cream: '#FFF8EC',
  card: '#FFFFFF',
  ink: '#222222',
  inkSoft: '#374151',
  grey: '#9CA3AF',
  greyLight: '#BEC5D1',
  line: '#F0E6D6',
  bg: '#F4F4F4',
  white: '#FFFFFF',
  green: '#1F9D3D',
  red: '#D93B2B',
};

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_800ExtraBold',
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };

export const shadow = (level: 1 | 2 | 3 = 1): ViewStyle =>
  Platform.select<ViewStyle>({
    web: {
      boxShadow: ['0 2px 8px rgba(88,45,9,0.08)', '0 8px 24px rgba(88,45,9,0.12)', '0 16px 40px rgba(88,45,9,0.18)'][level - 1],
    } as ViewStyle,
    default: {
      shadowColor: colors.brown,
      shadowOpacity: [0.08, 0.12, 0.18][level - 1],
      shadowRadius: [8, 16, 24][level - 1],
      shadowOffset: { width: 0, height: [2, 6, 12][level - 1] },
      elevation: [2, 5, 10][level - 1],
    },
  })!;

export const type: Record<string, TextStyle> = {
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.ink },
  h2: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft },
  small: { fontFamily: fonts.regular, fontSize: 12, color: colors.grey },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
};

/** Animated's native driver isn't available on web. */
export const useNative = Platform.OS !== 'web';

export const money = (n: number) => `£${n.toFixed(2)}`;
