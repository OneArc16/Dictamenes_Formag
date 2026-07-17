'use client';

import { useCallback, useSyncExternalStore } from 'react';

const SIDEBAR_PREFERENCE_EVENT = 'dictamy:sidebar-preference';

export function usePinnedSidebar(storageKey: string) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleChange = () => onStoreChange();
    window.addEventListener('storage', handleChange);
    window.addEventListener(SIDEBAR_PREFERENCE_EVENT, handleChange);

    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(SIDEBAR_PREFERENCE_EVENT, handleChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  }, [storageKey]);

  const pinned = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const togglePinned = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, String(!pinned));
      window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_EVENT));
    } catch {
      // La preferencia es opcional; la navegación funciona sin storage.
    }
  }, [pinned, storageKey]);

  return { pinned, togglePinned };
}
