// Testing Library matchers
require('@testing-library/jest-native/extend-expect');

// Safe Area mock (Expo/React Native)
const mockSafeAreaContext = require('react-native-safe-area-context/jest/mock').default;
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// AsyncStorage mock
jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// RN Reanimated mock (silences warnings in tests)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// --- keep your existing shim below ---
if (!Object.getOwnPropertyDescriptor(globalThis, '__ExpoImportMetaRegistry')) {
  Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
    configurable: true,
    get() {
      return { get: () => undefined, set: () => undefined };
    },
  });
}
