/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */

if (!Object.getOwnPropertyDescriptor(globalThis, '__ExpoImportMetaRegistry')) {
  Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
    configurable: true,
    get(){ return { get: () => undefined, set: () => undefined }; },
  });
}
// Mock AsyncStorage for tests to avoid NativeModule null errors
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
  clear: jest.fn(async () => {}),
}));
