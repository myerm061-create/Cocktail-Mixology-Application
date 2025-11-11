import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import SettingsScreen from "../app/(stack)/settings";

// ----- Quiet the RN warnings in this suite (optional but nicer logs)
const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
afterAll(() => warnSpy.mockRestore());

// ----- TurboModule stubs (same as you had)
jest.mock("react-native/src/private/devsupport/devmenu/specs/NativeDevMenu", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("react-native/src/private/specs_DEPRECATED/modules/NativeSettingsManager", () => ({
  __esModule: true,
  default: { getConstants: () => ({}) },
}));
jest.mock("react-native/Libraries/Settings/NativeSettingsManager", () => ({
  __esModule: true,
  default: { getConstants: () => ({}) },
}));

// ----- Partial RN mock for LayoutAnimation
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
  };
});

// ----- RNGH + safe area
jest.mock("react-native-gesture-handler", () => {
  const RN = jest.requireActual("react-native");
  return { ScrollView: RN.ScrollView };
});
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ----- expo-router (BackButton + calls)
export const mockPush = jest.fn();
export const mockReplace = jest.fn();
export const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: (...args: any[]) => mockPush(...args),
    replace: (...args: any[]) => mockReplace(...args),
    back: (...args: any[]) => mockBack(...args),
  }),
  useSegments: () => ["(stack)"],
  router: {
    push: (...args: any[]) => mockPush(...args),
    replace: (...args: any[]) => mockReplace(...args),
    back: (...args: any[]) => mockBack(...args),
  },
  Stack: { Screen: () => null },
}));

// ----- Light mocks for FormButton & ConfirmDialog
jest.mock("@/components/ui/FormButton", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({ title, onPress }: { title: string; onPress?: () => void }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: "button", onPress },
        React.createElement(Text, null, title)
      ),
  };
});

jest.mock("@/components/ui/ConfirmDialog", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({
      visible,
      title,
      message,
      confirmText,
      onCancel,
      onConfirm,
    }: {
      visible: boolean;
      title: string;
      message: string;
      confirmText: string;
      onCancel: () => void;
      onConfirm: () => void;
    }) =>
      visible
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(Text, null, title),
            React.createElement(Text, null, message),
            React.createElement(
              Pressable,
              { accessibilityRole: "button", onPress: onConfirm },
              React.createElement(Text, null, confirmText)
            ),
            React.createElement(
              Pressable,
              { accessibilityRole: "button", onPress: onCancel },
              React.createElement(Text, null, "Cancel")
            )
          )
        : null,
  };
});

describe("SettingsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
  });

  it("renders the Settings title", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  // Two switches: Push Notifications & Public Profile
  it("toggles Push Notification and Public Profile switches", () => {
    render(<SettingsScreen />);
    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(2);
    expect(switches[0].props.value).toBe(false);
    expect(switches[1].props.value).toBe(false);
    fireEvent(switches[0], "valueChange", true);
    fireEvent(switches[1], "valueChange", true);
    expect(screen.getAllByRole("switch")[0].props.value).toBe(true);
    expect(screen.getAllByRole("switch")[1].props.value).toBe(true);
  });

  // Expandable rows: Delete My Local Data & Delete My Account
  it("expands Delete My Local Data and opens/cancels the Clear Cache dialog", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Delete My Local Data"));
    fireEvent.press(screen.getByText("Clear Local Cache"));

    // Dialog is open; there are two "Clear Local Cache" texts (row title + dialog title).
    expect(screen.getAllByText("Clear Local Cache").length).toBeGreaterThan(1);
    fireEvent.press(screen.getByText("Cancel"));
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  // Expandable rows: Delete My Local Data & Delete My Account
  it("deletes account via dialog confirm and navigates to login", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Delete My Account"));
    fireEvent.press(screen.getByText("Delete Account (Permanent)"));

    // Two "Delete Account" nodes exist (title + confirm button). Click the button by pressing its parent.
    const deleteBtn = screen.getAllByRole("button").find((btn) => {
      try {
        within(btn).getByText("Delete Account");
        return true;
      } catch {
        return false;
      }
    });
    expect(deleteBtn).toBeTruthy();
    fireEvent.press(deleteBtn!);
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });

  // Expandable row: Change Password
  it("navigates to Change Password when revealed action is pressed", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Change Password"));
    fireEvent.press(screen.getByText("Go to Change Password"));
    expect(mockPush).toHaveBeenCalledWith("/(stack)/change-password");
  });

  // Units chips: oz (Imperial) & ml (Metric)
  it("toggles units chips and reflects active style", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Alcohol Calculator Units"));

    const ozText = screen.getByText("oz (Imperial)");
    const mlText = screen.getByText("ml (Metric)");
    // Walk up to the Pressable (node with onPress handler)
    const getPressable = (node: any) => {
      let cur: any = node;
      while (cur && !cur.props?.onPress) cur = cur.parent;
      return cur;
    };
    const ozPress = getPressable(ozText);
    const mlPress = getPressable(mlText);

    const flat = (node: any) => StyleSheet.flatten(node.props.style) || {};

    // Default: Imperial active (has chipActive bg '#2a2a2a')
    expect(flat(ozPress).backgroundColor).toBe("#2a2a2a");
    expect(flat(mlPress).backgroundColor).not.toBe("#2a2a2a");

    // Switch to Metric, then back to Imperial
    fireEvent.press(mlPress);
    expect(flat(mlPress).backgroundColor).toBe("#2a2a2a");
    expect(flat(ozPress).backgroundColor).not.toBe("#2a2a2a");

    fireEvent.press(ozPress);
    expect(flat(ozPress).backgroundColor).toBe("#2a2a2a");
    expect(flat(mlPress).backgroundColor).not.toBe("#2a2a2a");
  });

  // Sign Out button & dialog
  it("opens Sign Out dialog and confirms to navigate to login", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Sign Out"));

    // Confirm via the distinct button text in dialog
    fireEvent.press(screen.getByText("Log Out"));
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });
});
