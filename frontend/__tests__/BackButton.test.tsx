import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BackButton from "@/components/ui/BackButton";

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockSegments: string[] = ["(stack)", "drink", "[drinkId]"];

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useSegments: () => mockSegments,
}));

describe("BackButton", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  it("calls router.back() when there is navigation history", () => {
    mockSegments = ["(stack)", "drink", "[drinkId]"];
    const { getByTestId } = render(<BackButton />);
    fireEvent.press(getByTestId("back-button"));
    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("calls router.replace('/home') when no history exists", () => {
    mockSegments = [];
    const { getByTestId } = render(<BackButton />);
    fireEvent.press(getByTestId("back-button"));
    expect(mockReplace).toHaveBeenCalledWith("/home");
  });
});
