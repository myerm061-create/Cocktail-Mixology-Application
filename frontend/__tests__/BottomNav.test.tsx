import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { View, Animated } from 'react-native';
import BottomNav from '@/components/ui/BottomNav';

// CONTROLLED PATH FOR expo-router
let mockPath = '/home';
jest.mock('expo-router', () => ({
  Link: ({ children }: any) => children,
  usePathname: () => mockPath,
}));

// Manual mock for Ionicons to render icon name as accessibilityLabel
jest.mock('@expo/vector-icons');

// Deterministic animation
jest.spyOn(Animated, 'spring').mockImplementation(
  // @ts-expect-error minimal stub
  (_v, _c) => ({ start: (cb?: () => void) => cb && cb() }),
);

// Helper to change path per test
const setPath = (p: string) => {
  mockPath = p;
};

// Sample tab items
const TABS: any[] = [
  { icon: 'home-outline' as any, route: '/home' as any },
  { icon: 'search-outline' as any, route: '/search' as any },
  { icon: 'heart-outline' as any, route: '/favorites' as any },
  { icon: 'person-outline' as any, route: '/user-profile' as any },
];

describe('BottomNav', () => {
  // Test that the correct tab is marked selected based on the path
  it('marks the correct tab active based on pathname', () => {
    setPath('/search');
    render(<BottomNav items={TABS as any} safeArea={false} />);

    const buttons = screen.getAllByRole('button');
    const selected = buttons.filter(
      (b: any) => b.props?.accessibilityState?.selected === true,
    );
    expect(selected).toHaveLength(1);
    expect(buttons[1].props.accessibilityState.selected).toBe(true);
  });

  // Simulate pressing a tab and changing the path, then re-rendering
  it('updates selected tab when a tab is pressed (onPressIn) and navigation occurs', async () => {
    setPath('/home');
    const { rerender } = render(
      <BottomNav items={TABS as any} safeArea={false} />,
    );

    expect(
      screen.getAllByRole('button')[0].props.accessibilityState.selected,
    ).toBe(true);

    await act(async () => {
      const btns = screen.getAllByRole('button');
      fireEvent(btns[2], 'onPressIn');
      setPath('/favorites');
      rerender(<BottomNav items={TABS as any} safeArea={false} />);
    });

    const updated = screen.getAllByRole('button');
    expect(updated[2].props.accessibilityState.selected).toBe(true);
  });

  // Test that the active tab icon is the filled version (no "-outline")
  it('renders filled icon for the active tab', () => {
    setPath('/user-profile');
    render(<BottomNav items={TABS as any} safeArea={false} />);

    // active tab becomes "person" instead of "person-outline"
    expect(screen.getByLabelText('person')).toBeTruthy();
    expect(screen.getByLabelText('home-outline')).toBeTruthy();
    expect(screen.getByLabelText('search-outline')).toBeTruthy();
    expect(screen.getByLabelText('heart-outline')).toBeTruthy();
  });

  // Test that the red dot is positioned after layout
  it('shows the red dot indicator after layout (size 6)', async () => {
    setPath('/home');
    const { UNSAFE_getAllByType } = render(
      <BottomNav items={TABS as any} safeArea={false} />,
    );

    // Trigger onLayout so bar width is known
    const views = UNSAFE_getAllByType(View);
    const bar = views.find((v) => typeof v.props.onLayout === 'function');
    expect(bar).toBeTruthy();

    await act(async () => {
      bar!.props.onLayout({
        nativeEvent: { layout: { width: 300, height: 64 } },
      });
    });

    // Animated.View often flattens to View in tests—scan Views for the dot's style
    const afterViews = UNSAFE_getAllByType(View);
    const dot = afterViews.find((v) => {
      const flat = Array.isArray(v.props.style)
        ? Object.assign({}, ...v.props.style)
        : v.props.style || {};
      return (
        flat?.width === 6 &&
        flat?.height === 6 &&
        flat?.position === 'absolute' &&
        flat?.bottom === 6 &&
        flat?.borderRadius === 3
      );
    });
    expect(dot).toBeTruthy();
  });
});
