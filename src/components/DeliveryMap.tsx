import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@/theme';

/*
 * A hand-drawn style city map. The route runs from Lofi's to the customer and
 * the rider marker is placed along it by `progress` (0 → 1).
 */
const W = 360;
const H = 380;
const ROUTE: [number, number][] = [
  [70, 300],
  [70, 230],
  [150, 230],
  [150, 150],
  [250, 150],
  [250, 80],
  [300, 80],
];

const segLen = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
const total = segLen.reduce((a, b) => a + b, 0);

function pointAt(t: number): [number, number] {
  let d = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < segLen.length; i++) {
    if (d <= segLen[i]) {
      const f = d / segLen[i];
      return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * f, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * f];
    }
    d -= segLen[i];
  }
  return ROUTE[ROUTE.length - 1];
}

const streetsV = [40, 110, 190, 280, 330];
const streetsH = [40, 110, 190, 270, 340];

export function DeliveryMap({ progress }: { progress: number }) {
  const [w, setW] = useState(W);
  const k = w / W;
  const [rx, ry] = pointAt(progress);
  const done = ROUTE.slice(0, 1).concat(
    ROUTE.slice(1).filter((_, i) => segLen.slice(0, i + 1).reduce((a, b) => a + b, 0) <= progress * total),
    [[rx, ry]]
  );

  return (
    <View style={{ width: '100%', aspectRatio: W / H }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Rect x={0} y={0} width={W} height={H} fill="#F6F1E7" />
        {/* park + river */}
        <Rect x={200} y={210} width={110} height={90} rx={14} fill="#DDEBCF" />
        <Path
          d="M0 120 C 80 100, 120 140, 200 120 S 320 90, 360 110 L360 128 C 320 108, 280 140, 200 138 S 80 118, 0 138 Z"
          fill="#CFE3F2"
        />
        {/* streets */}
        <G stroke="#FFFFFF" strokeWidth={14}>
          {streetsV.map((x) => (
            <Polyline key={`v${x}`} points={`${x},0 ${x},${H}`} />
          ))}
          {streetsH.map((y) => (
            <Polyline key={`h${y}`} points={`0,${y} ${W},${y}`} />
          ))}
        </G>
        <G fill="#B9AE9C" fontSize={8} fontFamily="Poppins_500Medium">
          <SvgText x={44} y={64} transform="rotate(-90 44 64)">
            Bold St
          </SvgText>
          <SvgText x={196} y={36}>
            Hope St
          </SvgText>
          <SvgText x={120} y={286}>
            Duke St
          </SvgText>
          <SvgText x={226} y={262}>
            Park
          </SvgText>
        </G>
        {/* full route (dashed) and travelled part (solid) */}
        <Polyline
          points={ROUTE.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={colors.yellow}
          strokeWidth={6}
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <Polyline
          points={done.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={colors.yellow}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* home pin */}
        <Circle cx={300} cy={80} r={16} fill={colors.brown} />
        <Circle cx={300} cy={80} r={6} fill={colors.white} />
        {/* restaurant */}
        <Circle cx={70} cy={300} r={14} fill={colors.white} stroke={colors.brown} strokeWidth={3} />
      </Svg>

      <View style={[s.pinLabel, { left: 70 * k - 10, top: 300 * k - 10 }]}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={12} color={colors.brown} />
      </View>
      <View style={[s.rider, { left: rx * k - 22, top: ry * k - 22 }]}>
        <MaterialCommunityIcons name="moped" size={22} color={colors.brown} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  rider: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: { position: 'absolute', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
