import { useSyncExternalStore } from 'react';

/*
 * Tiny shared counter of open bottom sheets, so the floating tab bar can tuck
 * itself away while a sheet is showing (otherwise it would cover the sheet).
 */
let open = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const overlay = {
  push() {
    open += 1;
    emit();
  },
  pop() {
    open = Math.max(0, open - 1);
    emit();
  },
};

export function useOverlayOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open > 0,
    () => false
  );
}
