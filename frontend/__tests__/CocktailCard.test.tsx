<<<<<<< HEAD
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator, Image as RNImage } from 'react-native';
import CocktailCard from '@/components/ui/CocktailCard';
export { Image } from 'react-native';

jest.mock('expo-image');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (_props: any) => <></>,
}));

const getLoader = () =>
  screen.queryByRole('progressbar') ??
  screen.UNSAFE_queryByType(ActivityIndicator);
=======
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

// Mock native/Expo modules before importing the component under test.
jest.mock("expo-image", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react");
  const ImageComponent = ({ testID, onLoadEnd, onError, ...props }: any) =>
    ReactMock.createElement("Image", { testID, onLoadEnd, onError, ...props });
  return {
    __esModule: true,
    // Export both named and default to support different import styles
    Image: ImageComponent,
    default: ImageComponent,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (_props: any) => null,
}));

jest.mock("expo-linear-gradient", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react");
  return {
    __esModule: true,
    LinearGradient: ({ children, ...props }: any) =>
      ReactMock.createElement("View", props, children),
    default: ({ children, ...props }: any) =>
      ReactMock.createElement("View", props, children),
  };
});

// eslint-disable-next-line import/first
import CocktailCard from "@/components/ui/CocktailCard";

const getLoader = () => screen.queryByTestId("cocktail-loader");
>>>>>>> parent of ba5a057 (Revert "Revamp home page, similar to prototype design")

describe('CocktailCard', () => {
  // Smoke test is in smoke.test.tsx
  it('renders with accessible label', () => {
    render(<CocktailCard id="1" name="Margarita" />);
    expect(screen.getByLabelText('Open Margarita')).toBeTruthy();
  });

  // Test onPress callback
  it('calls onPress with the id', () => {
    const onPress = jest.fn();
    render(<CocktailCard id="42" name="Negroni" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Open Negroni'));
    expect(onPress).toHaveBeenCalledWith('42');
  });

  // Test image loading states
  it('shows loader while image loading then hides on onLoadEnd', () => {
    render(
      <CocktailCard
        id="2"
        name="Old Fashioned"
        thumbUrl="https://example.com/img.jpg"
      />,
    );
    expect(getLoader()).toBeTruthy();

<<<<<<< HEAD
    const img = screen.UNSAFE_getByType(RNImage);
    fireEvent(img, 'onLoadEnd');
=======
    const img = screen.getByTestId("cocktail-image");
    fireEvent(img, "onLoadEnd");
>>>>>>> parent of ba5a057 (Revert "Revamp home page, similar to prototype design")

    expect(getLoader()).toBeNull();
  });

  // Test image error handling
  it('on image error, hides loader and shows fallback (no image role)', () => {
    render(
      <CocktailCard
        id="3"
        name="Mojito"
        thumbUrl="https://example.com/bad.jpg"
      />,
    );

    const img = screen.getByTestId("cocktail-image");
    expect(img).toBeTruthy();
    expect(getLoader()).toBeTruthy();

    fireEvent(img, 'onError');

    expect(getLoader()).toBeNull();
    expect(screen.queryByTestId("cocktail-image")).toBeNull();
  });

  // Test favorite toggle button and callback
  it('favorite toggle updates a11y label and calls onToggleFavorite', () => {
    const onToggleFavorite = jest.fn();
    render(
      <CocktailCard
        id="77"
        name="Daiquiri"
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    const favBtn = screen.getByLabelText('Add to favorites');
    fireEvent.press(favBtn);
    expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    expect(onToggleFavorite).toHaveBeenLastCalledWith('77', true);

    const favBtn2 = screen.getByLabelText('Remove from favorites');
    fireEvent.press(favBtn2);
    expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
    expect(onToggleFavorite).toHaveBeenLastCalledWith('77', false);
  });
});
