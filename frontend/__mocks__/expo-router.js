export const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
export const usePathname = () => '/';
export const useLocalSearchParams = () => ({});
export const Link = ({ children }: any) => children; // passthrough
export type Href = string;
export const Stack = { Screen: () => null };
