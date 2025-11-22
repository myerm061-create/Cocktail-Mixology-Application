import React from "react";

// Mock native/Expo modules before importing the component under test.
jest.mock("expo-image", () => {
  const React = require("react");
  return {
    __esModule: true,
    // Export a simple Image component that preserves testID and event handlers.
    Image: ({ testID, onLoadEnd, onError, ...props }: any) =>
      React.createElement("Image", { testID, onLoadEnd, onError, ...props }),
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (_props: any) => null,
}));

import { render, screen, fireEvent } from "@testing-library/react-native";
import CocktailCard from "@/components/ui/CocktailCard";

const getLoader = () => screen.queryByTestId("cocktail-loader");

describe("CocktailCard", () => {
  // Smoke test is in smoke.test.tsx
  it("renders with accessible label", () => {
    render(<CocktailCard id="1" name="Margarita" />);
    expect(screen.getByLabelText("Open Margarita")).toBeTruthy();
  });

  // Test onPress callback
  it("calls onPress with the id", () => {
    const onPress = jest.fn();
    render(<CocktailCard id="42" name="Negroni" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Open Negroni"));
    expect(onPress).toHaveBeenCalledWith("42");
  });

  // Test image loading states
  it("shows loader while image loading then hides on onLoadEnd", () => {
    render(<CocktailCard id="2" name="Old Fashioned" thumbUrl="https://example.com/img.jpg" />);
    expect(getLoader()).toBeTruthy();

    const img = screen.getByTestId("cocktail-image");
    fireEvent(img, "onLoadEnd");

    expect(getLoader()).toBeNull();
  });

  // Test image error handling
  it("on image error, hides loader and shows fallback (no image role)", () => {
    render(<CocktailCard id="3" name="Mojito" thumbUrl="https://example.com/bad.jpg" />);

    const img = screen.getByTestId("cocktail-image");
    expect(img).toBeTruthy();
    expect(getLoader()).toBeTruthy();

    fireEvent(img, "onError");

    expect(getLoader()).toBeNull();
    expect(screen.queryByTestId("cocktail-image")).toBeNull();
  });

  // Test favorite toggle button and callback
  it("favorite toggle updates a11y label and calls onToggleFavorite", () => {
    const onToggleFavorite = jest.fn();
    render(
      <CocktailCard
        id="77"
        name="Daiquiri"
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    );

    const favBtn = screen.getByLabelText("Add to favorites");
    fireEvent.press(favBtn);
    expect(screen.getByLabelText("Remove from favorites")).toBeTruthy();
    expect(onToggleFavorite).toHaveBeenLastCalledWith("77", true);

    const favBtn2 = screen.getByLabelText("Remove from favorites");
    fireEvent.press(favBtn2);
    expect(screen.getByLabelText("Add to favorites")).toBeTruthy();
    expect(onToggleFavorite).toHaveBeenLastCalledWith("77", false);
  });
});
