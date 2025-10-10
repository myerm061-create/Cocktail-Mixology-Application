import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ActivityIndicator, Image as RNImage } from "react-native";
import CocktailCard from "@/components/ui/CocktailCard";
export { Image } from "react-native";


jest.mock("expo-image");

jest.mock("@expo/vector-icons", () => ({
  Ionicons: (_props: any) => <></>,
}));

const getLoader = () =>
  screen.queryByRole("progressbar") ??
  screen.UNSAFE_queryByType(ActivityIndicator);

describe("CocktailCard", () => {
  it("renders with accessible label", () => {
    render(<CocktailCard id="1" name="Margarita" />);
    expect(screen.getByLabelText("Open Margarita")).toBeTruthy();
  });

  it("calls onPress with the id", () => {
    const onPress = jest.fn();
    render(<CocktailCard id="42" name="Negroni" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Open Negroni"));
    expect(onPress).toHaveBeenCalledWith("42");
  });

  it("shows loader while image loading then hides on onLoadEnd", () => {
    render(<CocktailCard id="2" name="Old Fashioned" thumbUrl="https://example.com/img.jpg" />);
    expect(getLoader()).toBeTruthy();

    const img = screen.UNSAFE_getByType(RNImage);
    fireEvent(img, "onLoadEnd");

    expect(getLoader()).toBeNull();
  });

  it("on image error, hides loader and shows fallback (no image role)", () => {
    render(<CocktailCard id="3" name="Mojito" thumbUrl="https://example.com/bad.jpg" />);

    const img = screen.UNSAFE_getByType(RNImage);
    expect(img).toBeTruthy();
    expect(getLoader()).toBeTruthy();

    fireEvent(img, "onError");

    expect(getLoader()).toBeNull();
    expect(screen.UNSAFE_queryByType(RNImage)).toBeNull();
  });

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
