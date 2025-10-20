// __tests__/SettingsToggle.test.tsx
// Test ID: TC-SET-TOGGLE-01 / TC-SET-TOGGLE-02
// Linked Requirement: FR-18 (Settings Mgmt)
// Purpose: Ensure a settings toggle renders label and fires onChange with next value.

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsToggle from "../src/components/SettingsToggle";

describe("SettingsToggle", () => {
  it("renders the provided label", () => {
    const { getByText } = render(
      <SettingsToggle label="Enable notifications" value={false} onChange={() => {}} />
    );
    expect(getByText("Enable notifications")).toBeTruthy();
  });

  it("calls onChange with the next value when toggled", () => {
    const onChange = jest.fn();
    const { getByTestId, rerender } = render(
      <SettingsToggle label="Enable notifications" value={false} onChange={onChange} testID="notif-toggle" />
    );

    const toggle = getByTestId("notif-toggle");

    // Simulate turning ON
    fireEvent(toggle, "valueChange", true);
    expect(onChange).toHaveBeenCalledWith(true);

    // update value -> true and toggle OFF
    rerender(<SettingsToggle label="Enable notifications" value={true} onChange={onChange} testID="notif-toggle" />);
    fireEvent(toggle, "valueChange", false);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
