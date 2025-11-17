import React from "react";
import { render, screen } from "@testing-library/react-native";
import RecommendationsScreen from "../app/(stack)/recommendations";

// Mock safe area context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("RecommendationsScreen", () => {
  it("renders without crashing", () => {
    render(<RecommendationsScreen />);
    expect(screen.getByText("Recommendations")).toBeTruthy();
  });

  it("displays the title and placeholder text", () => {
    render(<RecommendationsScreen />);
    expect(screen.getByText("Recommendations")).toBeTruthy();
    expect(screen.getByText("Personalized cocktail suggestions will be shown here.")).toBeTruthy();
  });
});

