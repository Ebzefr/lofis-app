import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Header, Press, Stepper, T } from '@/components/ui';
import { uid, useApp } from '@/store/AppStore';
import { colors, radius } from '@/theme';

const TIMES = ['12:00', '13:30', '15:00', '17:00', '18:30', '19:30', '20:30', '21:30'];
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Deterministic "fully booked" slots so the calendar feels real.
const taken = (date: Date, time: string) => (date.getDate() * 7 + time.charCodeAt(1) + time.charCodeAt(3)) % 5 === 0;

/** Table booking: guests → date → time → confirm. Built around the case study's "fewer steps" goal. */
export default function Reserve() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useApp();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [done, setDone] = useState(false);

  const cells = useMemo(() => {
    const first = (month.getDay() + 6) % 7; // Monday first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const closed = (d: Date) => d < today || d.getDay() === 1; // closed on Mondays

  const confirm = () => {
    if (!date || !time) return;
    dispatch({ type: 'addBooking', booking: { id: uid(), date: date.toISOString(), time, guests, createdAt: Date.now() } });
    setDone(true);
  };

  if (done && date && time) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Header title="Booking" back={false} />
        <View style={[s.done, { paddingBottom: insets.bottom + 24 }]}>
          <View style={{ alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
            <View style={s.tick}>
              <Ionicons name="checkmark" size={42} color={colors.white} />
            </View>
            <T w="bold" size={24} style={{ textAlign: 'center' }}>
              Your table is booked!
            </T>
            <Card style={{ alignSelf: 'stretch', gap: 10, marginTop: 8 }}>
              <Detail icon="calendar-outline" text={date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} />
              <Detail icon="time-outline" text={time} />
              <Detail icon="people-outline" text={`Table for ${guests}`} />
              <Detail icon="location-outline" text="Lofi's, Bold St, Liverpool" />
            </Card>
            <T size={12} color={colors.grey} style={{ textAlign: 'center' }}>
              We&apos;ve saved it to your profile. See you soon!
            </T>
          </View>
          <Button title="Browse the menu" onPress={() => router.replace('/home')} />
          <Button title="View my bookings" variant="ghost" onPress={() => router.replace('/profile')} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Book a table">
        <T w="bold" size={22} color={colors.white} style={{ marginTop: 14 }}>
          Eat in at Lofi&apos;s
        </T>
        <T size={12} color="rgba(255,255,255,0.75)">
          Bold St, Liverpool · open Tue to Sun
        </T>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 140 }}>
        <Card style={s.guests}>
          <View style={{ flex: 1 }}>
            <T w="semibold" size={15}>
              Guests
            </T>
            <T size={12} color={colors.grey}>
              Up to 10 online
            </T>
          </View>
          <Stepper value={guests} min={1} onChange={(v) => setGuests(Math.min(10, v))} />
        </Card>

        <Card style={{ gap: 12 }}>
          <View style={s.monthRow}>
            <Press
              onPress={() => canPrev && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              disabled={!canPrev}
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={20} color={colors.brown} />
            </Press>
            <T w="semibold" size={15}>
              {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </T>
            <Press onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={20} color={colors.brown} />
            </Press>
          </View>
          <View style={s.grid}>
            {WEEK.map((d, i) => (
              <View key={`${d}${i}`} style={s.cell}>
                <T w="semibold" size={11} color={colors.grey}>
                  {d}
                </T>
              </View>
            ))}
            {cells.map((d, i) =>
              d ? (
                <View key={dayKey(d)} style={s.cell}>
                  <Press
                    onPress={() => (setDate(d), setTime(null))}
                    disabled={closed(d)}
                    style={[
                      s.day,
                      date && dayKey(date) === dayKey(d) && s.dayOn,
                      dayKey(d) === dayKey(today) && !(date && dayKey(date) === dayKey(d)) && s.today,
                    ]}
                    accessibilityLabel={d.toDateString()}
                  >
                    <T
                      w="medium"
                      size={13}
                      color={date && dayKey(date) === dayKey(d) ? colors.brown : closed(d) ? colors.greyLight : colors.ink}
                    >
                      {d.getDate()}
                    </T>
                  </Press>
                </View>
              ) : (
                <View key={`e${i}`} style={s.cell} />
              )
            )}
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <T w="semibold" size={15}>
            Time
          </T>
          {!date ? (
            <T size={12} color={colors.grey}>
              Pick a date to see available times.
            </T>
          ) : (
            <View style={s.times}>
              {TIMES.map((t) => {
                const full = taken(date, t);
                const on = time === t;
                return (
                  <Press
                    key={t}
                    onPress={() => setTime(t)}
                    disabled={full}
                    style={[s.time, on && s.timeOn]}
                    accessibilityLabel={`${t}${full ? ', fully booked' : ''}`}
                  >
                    <T
                      w="semibold"
                      size={13}
                      color={on ? colors.brown : full ? colors.greyLight : colors.ink}
                      style={full ? { textDecorationLine: 'line-through' } : undefined}
                    >
                      {t}
                    </T>
                  </Press>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title={
            date && time
              ? `Confirm · ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${time}`
              : 'Choose a date and time'
          }
          disabled={!date || !time}
          onPress={confirm}
        />
      </View>
    </View>
  );
}

function Detail({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={18} color={colors.brown} />
      <T size={14}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  guests: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.yellow },
  today: { borderWidth: 1.5, borderColor: colors.brown },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  time: {
    width: '22%',
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  timeOn: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: colors.white },
  done: { flex: 1, padding: 24, gap: 12 },
  tick: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center' },
});
