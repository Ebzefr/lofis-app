import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Header, Press, T, textInput, type IconName } from '@/components/ui';
import { getDish } from '@/data/menu';
import { stamp, totals, uid, useApp, type Order, type OrderMode } from '@/store/AppStore';
import { colors, money, radius, shadow } from '@/theme';

const STEPS = ['Your details', 'Delivery', 'Payment'];
const payments: { id: Order['payment']; label: string; icon: IconName }[] = [
  { id: 'card', label: 'Card ending 4242', icon: 'card-outline' },
  { id: 'apple', label: 'Apple Pay / Google Pay', icon: 'phone-portrait-outline' },
  { id: 'cash', label: 'Cash on delivery', icon: 'cash-outline' },
];

/** Three-step checkout. Nothing is charged: "Place order" just saves the order locally. */
export default function Checkout() {
  const insets = useSafeAreaInsets();
  const { user, address, basket, dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('07700 900123');
  const [mode, setMode] = useState<OrderMode>('delivery');
  const [addr, setAddr] = useState(address);
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState<Order['payment']>('card');

  const t = totals(basket, mode);
  const ok = [name.trim().length > 1 && phone.replace(/\D/g, '').length >= 10, mode === 'collect' || addr.trim().length > 4, true][step];

  const place = () => {
    const order: Order = {
      id: uid().toUpperCase(),
      lines: basket,
      mode,
      name: name.trim(),
      phone,
      address: mode === 'delivery' ? addr.trim() : 'Collect from Lofi’s, Bold St',
      payment,
      subtotal: t.subtotal,
      fees: t.fees,
      total: t.total,
      placedAt: stamp(),
    };
    dispatch({ type: 'placeOrder', order });
    if (mode === 'delivery' && addr.trim() !== address) dispatch({ type: 'setAddress', address: addr.trim() });
    router.replace({ pathname: '/order-placed', params: { id: order.id } });
  };

  if (!basket.length) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Header title="Checkout" />
        <View style={{ padding: 24, gap: 12 }}>
          <T>Your basket is empty.</T>
          <Button title="Browse the menu" onPress={() => router.replace('/home')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Checkout">
        {/* 1 · 2 · 3 progress */}
        <View style={s.steps}>
          {STEPS.map((label, i) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <Press
                onPress={() => i < step && setStep(i)}
                style={[s.stepDot, i <= step && s.stepDotOn]}
                accessibilityLabel={`Step ${i + 1}: ${label}`}
              >
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color={colors.brown} />
                ) : (
                  <T w="bold" size={12} color={i === step ? colors.brown : colors.white}>
                    {i + 1}
                  </T>
                )}
              </Press>
              {i < 2 && <View style={[s.stepLine, i < step && { backgroundColor: colors.yellow }]} />}
            </View>
          ))}
        </View>
        <T w="semibold" size={16} color={colors.white} style={{ marginTop: 12 }}>
          {STEPS[step]}
        </T>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Field label="Full name">
              <TextInput
                value={name}
                onChangeText={setName}
                style={textInput}
                placeholder="Your name"
                placeholderTextColor={colors.greyLight}
              />
            </Field>
            <Field label="Phone number">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={textInput}
                keyboardType="phone-pad"
                placeholder="07…"
                placeholderTextColor={colors.greyLight}
              />
            </Field>
            <T size={12} color={colors.grey}>
              We&apos;ll only use this to update you about your order.
            </T>
          </>
        )}

        {step === 1 && (
          <>
            <View style={s.toggle}>
              {(['delivery', 'collect'] as const).map((m) => (
                <Press
                  key={m}
                  onPress={() => setMode(m)}
                  style={[s.toggleBtn, mode === m && s.toggleOn]}
                  accessibilityLabel={m === 'delivery' ? 'Delivery' : 'Collect'}
                >
                  <MaterialCommunityIcons name={m === 'delivery' ? 'moped' : 'storefront-outline'} size={18} color={colors.brown} />
                  <T w="semibold" size={14} color={colors.brown}>
                    {m === 'delivery' ? 'Deliver' : 'Collect'}
                  </T>
                </Press>
              ))}
            </View>
            {mode === 'delivery' ? (
              <>
                <Field label="Delivery address">
                  <TextInput
                    value={addr}
                    onChangeText={setAddr}
                    style={textInput}
                    placeholder="Street, city, postcode"
                    placeholderTextColor={colors.greyLight}
                  />
                </Field>
                <Field label="Note for the rider (optional)">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    style={textInput}
                    placeholder="e.g. Ring the top bell"
                    placeholderTextColor={colors.greyLight}
                  />
                </Field>
                <Card style={s.eta}>
                  <Ionicons name="time-outline" size={20} color={colors.brown} />
                  <T size={13}>
                    Arrives in about{' '}
                    <T w="semibold" size={13}>
                      35 to 45 min
                    </T>
                  </T>
                </Card>
              </>
            ) : (
              <Card style={s.eta}>
                <Ionicons name="storefront-outline" size={20} color={colors.brown} />
                <View style={{ flex: 1 }}>
                  <T w="semibold" size={14}>
                    Lofi&apos;s, Bold St
                  </T>
                  <T size={12} color={colors.grey}>
                    Ready in about 15 min · no delivery fee
                  </T>
                </View>
              </Card>
            )}
          </>
        )}

        {step === 2 && (
          <>
            {payments.map((p) => (
              <Press key={p.id} onPress={() => setPayment(p.id)} accessibilityLabel={p.label}>
                <Card style={[s.pay, payment === p.id && s.payOn]}>
                  <Ionicons name={p.icon} size={22} color={colors.brown} />
                  <T w="medium" size={14} style={{ flex: 1 }}>
                    {p.label}
                  </T>
                  <Ionicons name={payment === p.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.brown} />
                </Card>
              </Press>
            ))}
            <Card style={{ gap: 8 }}>
              <T w="semibold" size={15}>
                Order summary
              </T>
              {basket.map((l) => (
                <View key={l.key} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T size={13} color={colors.inkSoft} style={{ flex: 1 }} numberOfLines={1}>
                    {l.qty} × {getDish(l.dishId)?.name}
                  </T>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
              <Line label="Subtotal" value={money(t.subtotal)} />
              <Line label={mode === 'delivery' ? 'Delivery & service' : 'Service'} value={money(t.fees)} />
              <Line label="Total" value={money(t.total)} bold />
            </Card>
            <T size={11} color={colors.grey} style={{ textAlign: 'center' }}>
              Prototype: no payment is taken.
            </T>
          </>
        )}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {step < 2 ? (
          <Button
            title="Continue"
            disabled={!ok}
            onPress={() => setStep(step + 1)}
            right={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          />
        ) : (
          <Button title={`Place order · ${money(t.total)}`} onPress={place} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <T w="medium" size={13}>
        {label}
      </T>
      {children}
    </View>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <T w={bold ? 'bold' : 'regular'} size={bold ? 15 : 13} color={bold ? colors.ink : colors.grey}>
        {label}
      </T>
      <T w="bold" size={bold ? 15 : 13} color={bold ? colors.brown : colors.ink}>
        {value}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  steps: { flexDirection: 'row', alignItems: 'center', marginTop: 16, alignSelf: 'center', width: 220 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotOn: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 6 },
  toggle: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.pill, padding: 5, ...shadow(1) },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleOn: { backgroundColor: colors.yellow },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: 'transparent' },
  payOn: { borderColor: colors.brown },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: colors.white, ...shadow(3) },
});
