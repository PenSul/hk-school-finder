import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const storage = createMMKV();

/**
 * Zustand-compatible storage adapter for MMKV.
 * Used with createJSONStorage(() => mmkvStateStorage) in persist middleware.
 */
export const mmkvStateStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
