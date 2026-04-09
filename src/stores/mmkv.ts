import type { StateStorage } from "zustand/middleware";

interface MMKVLike {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
}

function createStorage(): MMKVLike {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require("react-native-mmkv");
    return createMMKV();
  } catch {
    // Fallback for Expo Go where NitroModules is unavailable
    const map = new Map<string, string>();
    return {
      getString: (key: string) => map.get(key),
      set: (key: string, value: string) => map.set(key, value),
      remove: (key: string) => map.delete(key),
    };
  }
}

export const storage = createStorage();

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
