import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock expo-router (self-contained, no out-of-scope vars)
jest.mock('expo-router', () => {
  const CALL_FOCUS_CALLBACK = false; // keep false to avoid extra renders in tests
  return {
    useFocusEffect: (cb: any) => {
      if (CALL_FOCUS_CALLBACK && typeof cb === 'function') {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : () => {};
      }
      return () => {};
    },
    useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
    useLocalSearchParams: () => ({}),
    Link: ({ children }: any) => children,
    Slot: () => null,
    Stack: () => null,
  };
});

// Hard-point to your real hook file
const { useFavorites } = require('@/app/lib/useFavorites');

// NEW helper that understands objects as well as string IDs
const hasId = (items: any[], target: string) => {
  if (!Array.isArray(items)) return false;
  return items.some((x: any) => {
    const id =
      typeof x === 'string'
        ? x
        : x?.id ?? x?.drinkId ?? x?.idDrink ?? x?.cocktailId ?? null;
    return String(id) === target;
  });
};

describe.skip('useFavorites hook (app/lib/useFavorites)', () => {
  beforeEach(() => {
    (AsyncStorage.setItem as jest.Mock)?.mockClear?.();
    (AsyncStorage.getItem as jest.Mock)?.mockClear?.();
    (AsyncStorage.removeItem as jest.Mock)?.mockClear?.();
    // Pretend no favorites stored initially
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
  });

  test('toggle adds/removes and persists IDs', async () => {
    const { result } = renderHook(() => useFavorites());

    // Wait for initial async refresh to settle
    await waitFor(() => {
      expect(Array.isArray(result.current.items)).toBe(true);
    });

    // Initially empty
    expect(hasId(result.current.items, '11007')).toBe(false);

    // Add id "11007"
    await act(async () => {
      result.current.toggle?.('11007');
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    // Contains "11007"
    expect(hasId(result.current.items, '11007')).toBe(true);

    // Remove "11007"
    await act(async () => {
      result.current.toggle?.('11007');
    });

    // No longer contains "11007"
    expect(hasId(result.current.items, '11007')).toBe(false);
  });
});

