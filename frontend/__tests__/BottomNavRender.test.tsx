// __tests__/BottomNavRender.test.tsx
// Test IDs: TC-NAV-01 / TC-NAV-02
// Linked Requirement: FR-21 (Navigation Core)
// Purpose: Verify bottom navigation renders 5 core icons and responds to press.

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BottomNav from "../src/components/BottomNav";

describe("BottomNav", () => {
  it("renders the 5 default labels", () => {
    const { getByText } = render(<BottomNav />);
    ["Home", "Create", "Search", "Profile", "Favorites"].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it("triggers onPress callback for custom items", () => {
    const onPress = jest.fn();
    const items = [{ label: "Home", onPress }];
    const { getByTestId } = render(<BottomNav items={items} />);
    fireEvent.press(getByTestId("nav-Home"));
    expect(onPress).toHaveBeenCalled();
  });
});

