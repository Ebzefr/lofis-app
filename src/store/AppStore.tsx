import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { allExtras, DELIVERY_FEE, getDish, mealSizes, pizzaCrusts, pizzaSizes, SERVICE_FEE } from '@/data/menu';

/*
 * All app state lives here. There is no backend: everything is kept in memory
 * and saved to device storage (localStorage on web) so it survives a refresh.
 */

export type User = { name: string; email: string };

export type BasketLine = {
  key: string;
  dishId: string;
  size: string;
  crust?: string;
  extras: string[];
  drinks: string[];
  qty: number;
};

export type OrderMode = 'delivery' | 'collect';

export type Order = {
  id: string;
  lines: BasketLine[];
  mode: OrderMode;
  name: string;
  phone: string;
  address: string;
  payment: 'card' | 'cash' | 'apple';
  subtotal: number;
  fees: number;
  total: number;
  placedAt: number;
};

export type Booking = { id: string; date: string; time: string; guests: number; createdAt: number };

type State = {
  ready: boolean;
  user: User | null;
  onboarded: boolean;
  address: string;
  basket: BasketLine[];
  wishlist: string[];
  orders: Order[];
  bookings: Booking[];
};

const initial: State = {
  ready: false,
  user: null,
  onboarded: false,
  address: 'Bold St, Liverpool L1 4DS',
  basket: [],
  wishlist: ['pizza-pepperoni', 'burger-double-smash', 'chinese-salt-and-pepper-chicken'],
  orders: [],
  bookings: [],
};

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'signIn'; user: User }
  | { type: 'signOut' }
  | { type: 'onboarded' }
  | { type: 'setAddress'; address: string }
  | { type: 'addLine'; line: BasketLine }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'removeLine'; key: string }
  | { type: 'clearBasket' }
  | { type: 'toggleWish'; id: string }
  | { type: 'placeOrder'; order: Order }
  | { type: 'addBooking'; booking: Booking }
  | { type: 'reset' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.state, ready: true };
    case 'signIn':
      return { ...s, user: a.user, onboarded: true };
    case 'signOut':
      return { ...s, user: null };
    case 'onboarded':
      return { ...s, onboarded: true };
    case 'setAddress':
      return { ...s, address: a.address };
    case 'addLine': {
      // merge identical lines (same dish + same choices)
      const same = s.basket.find((l) => sameChoices(l, a.line));
      if (same) return { ...s, basket: s.basket.map((l) => (l === same ? { ...l, qty: l.qty + a.line.qty } : l)) };
      return { ...s, basket: [...s.basket, a.line] };
    }
    case 'setQty':
      return {
        ...s,
        basket: a.qty <= 0 ? s.basket.filter((l) => l.key !== a.key) : s.basket.map((l) => (l.key === a.key ? { ...l, qty: a.qty } : l)),
      };
    case 'removeLine':
      return { ...s, basket: s.basket.filter((l) => l.key !== a.key) };
    case 'clearBasket':
      return { ...s, basket: [] };
    case 'toggleWish':
      return { ...s, wishlist: s.wishlist.includes(a.id) ? s.wishlist.filter((w) => w !== a.id) : [a.id, ...s.wishlist] };
    case 'placeOrder':
      return { ...s, orders: [a.order, ...s.orders], basket: [] };
    case 'addBooking':
      return { ...s, bookings: [a.booking, ...s.bookings] };
    case 'reset':
      return { ...initial, ready: true };
  }
}

const sameChoices = (a: BasketLine, b: BasketLine) =>
  a.dishId === b.dishId &&
  a.size === b.size &&
  a.crust === b.crust &&
  [...a.extras].sort().join() === [...b.extras].sort().join() &&
  [...a.drinks].sort().join() === [...b.drinks].sort().join();

/* ---------------- Pricing helpers ---------------- */

export function linePrice(l: Omit<BasketLine, 'key' | 'qty'>) {
  const dish = getDish(l.dishId);
  if (!dish) return 0;
  const sizes = dish.category === 'pizza' ? pizzaSizes : mealSizes;
  const size = sizes.find((s) => s.id === l.size)?.add ?? 0;
  const crust = pizzaCrusts.find((c) => c.id === l.crust)?.add ?? 0;
  const extras = [...l.extras, ...l.drinks].reduce((sum, id) => sum + (allExtras.find((e) => e.id === id)?.price ?? 0), 0);
  return dish.price + size + crust + extras;
}

/** Short description of the choices on a basket line, e.g. '14" · Thin & crispy · Olives, Cola'. */
export function lineSummary(l: BasketLine) {
  const dish = getDish(l.dishId);
  if (!dish) return '';
  const sizes = dish.category === 'pizza' ? pizzaSizes : mealSizes;
  const parts = [dish.category === 'pizza' ? sizes.find((x) => x.id === l.size)?.label : sizes.find((x) => x.id === l.size)?.name];
  if (l.crust && l.crust !== 'classic') parts.push(pizzaCrusts.find((c) => c.id === l.crust)?.name);
  const extras = [...l.extras, ...l.drinks].map((id) => allExtras.find((e) => e.id === id)?.name).filter(Boolean);
  if (extras.length) parts.push(extras.join(', '));
  return parts.filter(Boolean).join(' · ');
}

export function totals(lines: BasketLine[], mode: OrderMode = 'delivery') {
  const subtotal = lines.reduce((s, l) => s + linePrice(l) * l.qty, 0);
  const fees = lines.length ? SERVICE_FEE + (mode === 'delivery' ? DELIVERY_FEE : 0) : 0;
  return { subtotal, fees, total: subtotal + fees, count: lines.reduce((n, l) => n + l.qty, 0) };
}

/* ---------------- Order progress (demo timeline) ---------------- */

// Real minutes are compressed so the whole journey plays out in under a minute.
export const DEMO = { cookSeconds: 20, rideSeconds: 30, displayCookMinutes: 15, displayRideMinutes: 20 };

export function orderStage(order: Order, now: number) {
  const t = (now - order.placedAt) / 1000;
  if (t < DEMO.cookSeconds) return { stage: 'cooking' as const, progress: t / DEMO.cookSeconds };
  if (order.mode === 'collect') return { stage: 'ready' as const, progress: 1 };
  if (t < DEMO.cookSeconds + DEMO.rideSeconds) return { stage: 'on-the-way' as const, progress: (t - DEMO.cookSeconds) / DEMO.rideSeconds };
  return { stage: 'delivered' as const, progress: 1 };
}

/* ---------------- Context ---------------- */

const KEY = 'lofis-app-state-v1';

type Store = State & {
  dispatch: React.Dispatch<Action>;
  basketTotals: ReturnType<typeof totals>;
  isWished: (id: string) => boolean;
};

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => dispatch({ type: 'hydrate', state: raw ? JSON.parse(raw) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }))
      .finally(() => (loaded.current = true));
  }, []);

  useEffect(() => {
    if (!loaded.current || !state.ready) return;
    const { ready, ...persist } = state;
    AsyncStorage.setItem(KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  const isWished = useCallback((id: string) => state.wishlist.includes(id), [state.wishlist]);
  const value = useMemo(() => ({ ...state, dispatch, basketTotals: totals(state.basket), isWished }), [state, isWished]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

export const uid = () => Math.random().toString(36).slice(2, 9);
/** Current time, for event handlers (keeps Date.now() out of render code). */
export const stamp = () => Date.now();
