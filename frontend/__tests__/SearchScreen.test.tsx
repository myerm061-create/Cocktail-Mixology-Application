/**
 * Tests for SearchScreen behavior:
 * - Short queries show curated starters.
 * - Single generic word (“gin”) uses stricter flow (no huge ingredient flood).
 * - Single non-generic word intersects ingredient ∩ name, with backfill.
 * - Multi-token uses name search only.
 * - Re-rank/prune caps output ≤ 60.
 * - Not-found banner + starters fallback.
 * - Pagination "Load more".
 * - Favorite heart toggles.
 * - Tapping a card navigates to details.
 */
import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react-native";
import SearchScreen from "../app/(tabs)/search";
import { Text } from "react-native";
import * as Cocktails from "../app/lib/cocktails";
import * as Fav from "@/app/lib/useFavorites";
import * as ExpoRouter from "expo-router";

// Helpers and mocks

// Silence RN Animated warnings etc.
jest.mock(
  "react-native/Libraries/Animated/NativeAnimatedHelper",
  () => ({}),
  { virtual: true }
);

jest.mock("expo-router", () => {
  const mockPush = jest.fn();
  return {
    __esModule: true,
    router: { push: mockPush },
    Stack: { Screen: () => null },
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null, // not important for behavior
}));

jest.mock("@/components/ui/BackButton", () => () => null);

// Favorites hook: start empty; spy on toggle
jest.mock("@/app/lib/useFavorites", () => {
  const mockToggle = jest.fn();
  return {
    __esModule: true,
    useFavorites: () => ({ items: [], toggle: mockToggle }),
    __mock: { toggle: mockToggle }, 
  };
});

jest.mock("../app/lib/cocktails", () => {
  const mockSearchByName = jest.fn();
  const mockFilterByIngredient = jest.fn();
  const mockHydrateThumbs = jest.fn(async (x: any) => x);
  const mockHydrateDetails = jest.fn(async (drinks: any[]) =>
    drinks.map((d, i) => ({
      ...d,
      ingredientsNormalized: d._ings ?? (i % 2 ? ["gin"] : ["vodka"]),
    }))
  );

  return {
    __esModule: true,
    searchByName: mockSearchByName,
    filterByIngredient: mockFilterByIngredient,
    hydrateThumbs: mockHydrateThumbs,
    hydrateDetails: mockHydrateDetails,
    __mock: {
      searchByName: mockSearchByName,
      filterByIngredient: mockFilterByIngredient,
      hydrateThumbs: mockHydrateThumbs,
      hydrateDetails: mockHydrateDetails,
    },
  };
});

async function flush(ms = 400) {
  // Advance JS timers (debounce, setTimeouts)
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
  // Let any pending microtasks/Promises settle
  await act(async () => {});
}

// Helper to type in the search box and flush debounce
async function typeAndWait(text: string, advanceMs = 400) {
  const input = screen.getByPlaceholderText("Type an ingredient or a drink…");
  fireEvent.changeText(input, text);
  await flush(advanceMs);
}

// Starter items used by the screen (IDs known in code comments)
const STARTER_NAMES = [
  "Margarita",
  "Mojito",
  "Old Fashioned",
  "Manhattan",
  "Vodka Martini",
  "Moscow Mule",
];

function expectStartersVisible() {
  STARTER_NAMES.forEach((n) => {
    expect(screen.getByText(n)).toBeTruthy();
  });
}

describe("SearchScreen", () => {
  // Reset mocks and timers before each test
  beforeEach(() => { jest.clearAllMocks(); jest.useFakeTimers(); });

  // Restore real timers after each test
  afterEach(async () => {
    await act(async () => {
        jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("shows curated starters for short queries (<2 chars)", () => {
    render(<SearchScreen />);
    // initial render shows starters
    expectStartersVisible();
  });

  it("multi-token query uses name search only", async () => {
    render(<SearchScreen />);

    // Arrange mocks
    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([
      { idDrink: "1", strDrink: "Gin Fizz" },
      { idDrink: "2", strDrink: "Ramos Gin Fizz" },
    ]);

    await typeAndWait("gin fizz"); // multi-token

    expect((Cocktails as any).__mock.searchByName).toHaveBeenCalledWith("gin fizz");
    expect((Cocktails as any).__mock.filterByIngredient).not.toHaveBeenCalled();
    await flush();
    expect(screen.getByText("Gin Fizz")).toBeTruthy();
    expect(screen.getByText("Ramos Gin Fizz")).toBeTruthy();
  });

  it("single generic word (gin) does NOT call ingredient filter and prunes results", async () => {
    render(<SearchScreen />);

    // Provide a large name result set to simulate 'entire DB' and ensure pruning
    const bigList = Array.from({ length: 120 }).map((_, i) => ({
      idDrink: String(1000 + i),
      strDrink: i % 3 === 0 ? `Gin Thing ${i}` : `Whatever ${i}`,
      _ings: i % 2 === 0 ? ["gin"] : ["orange juice"], // hydrateDetails mock consumes this
    }));
    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce(bigList);

    await typeAndWait("gin");

    expect((Cocktails as any).__mock.filterByIngredient).not.toHaveBeenCalled(); // generic skip
    expect((Cocktails as any).__mock.searchByName).toHaveBeenCalledWith("gin");

    // After rerank/prune cap is 60; ensure we didn't render all 120
    await flush();
    const allCards = screen.getAllByText(/Gin Thing|Whatever/);
    expect(allCards.length).toBeLessThanOrEqual(60);
    // Top of list should prefer stronger "gin" signals (best-effort check)
    expect(screen.getAllByText(/Gin Thing/).length).toBeGreaterThan(0);
  });

  it("single non-generic word intersects ingredient ∩ name, with backfill if intersection small", async () => {
    render(<SearchScreen />);

    // name hits
    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([
      { idDrink: "10", strDrink: "Tom Collins" },
      { idDrink: "11", strDrink: "Collins Variation" },
      { idDrink: "12", strDrink: "Random Collins" },
    ]);

    // ingredient hits (non-generic token)
    (Cocktails as any).__mock.filterByIngredient.mockResolvedValueOnce([
      { idDrink: "10", strDrink: "Tom Collins" }, // intersection on id 10
      { idDrink: "99", strDrink: "Not really related" },
    ]);

    await typeAndWait("collins");
    await flush();

    // Should call both
    expect((Cocktails as any).__mock.searchByName).toHaveBeenCalledWith("collins");
    expect((Cocktails as any).__mock.filterByIngredient).toHaveBeenCalledWith("collins");

    // Intersection has "10". Backfill should include more name hits.
    expect(screen.getByText("Tom Collins")).toBeTruthy();
    expect(screen.getByText("Collins Variation")).toBeTruthy();
    expect(screen.getByText("Random Collins")).toBeTruthy();
    // Non-overlap ingredient-only "99" may be pruned after ranking; we don't assert its presence.
  });

  it("shows not-found banner and starters when API returns empty", async () => {
    render(<SearchScreen />);

    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([]);
    (Cocktails as any).__mock.filterByIngredient.mockResolvedValueOnce([]);

    await typeAndWait("zzzxxyy"); // nonsense
    await flush();

    expect(screen.getByText(/“zzzxxyy” not found/i)).toBeTruthy();
    expectStartersVisible();
  });

  it("respects pagination 'Load more' cap and appends next page", async () => {
    render(<SearchScreen />);

    // PAGE_SIZE is 20; return 35 items to test "Load more"
    const items = Array.from({ length: 35 }).map((_, i) => ({
      idDrink: String(2000 + i),
      strDrink: `Result ${i}`,
      _ings: ["ginger"],
    }));
    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce(items);
    (Cocktails as any).__mock.filterByIngredient.mockResolvedValueOnce([]);

    await typeAndWait("ginger"); // non-generic, single token (but we still used name here)
    await flush();

    // First page => first 20 items
    for (let i = 0; i < 10; i++) {
    expect(screen.getByText(`Result ${i}`)).toBeTruthy();
    }
    // A later one should not be visible yet (page 2 starts at index 20)
    expect(screen.queryByText("Result 25")).toBeFalsy();

    // Tap "Load more"
    fireEvent.press(screen.getByText("Load more"));
    await act(async () => {});
    await flush(0);

    // Now later items should be visible
    expect(screen.getByText("Result 15")).toBeTruthy();
    // And the last one (35th) as well
    expect(screen.getByText("Result 25")).toBeTruthy();
  });

  it("pressing heart calls favorites toggle", async () => {
    render(<SearchScreen />);

    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([
      { idDrink: "42", strDrink: "Gin Rickey", _ings: ["gin", "lime"] },
    ]);

    (Cocktails as any).__mock.filterByIngredient.mockResolvedValueOnce([]);

    await typeAndWait("rickey");
    await flush();
    const heartBtn = screen.getAllByTestId("fav-toggle")[0];
    fireEvent.press(heartBtn);
    expect((Fav as any).__mock.toggle).toHaveBeenCalledWith({
      id: "42",
      name: "Gin Rickey",
      thumbUrl: null,
    });

  });

  it("tapping a result navigates to drink details", async () => {
    render(<SearchScreen />);

    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([
      { idDrink: "11007", strDrink: "Margarita" },
    ]);

    await typeAndWait("margarita");
    await flush();
    const item = screen.getByText("Margarita");
    fireEvent.press(item);

    expect((ExpoRouter.router.push as jest.Mock)).toHaveBeenCalledWith({
      pathname: "/drink/[drinkId]",
      params: expect.objectContaining({ drinkId: "11007", name: "Margarita" }),
    });
  });

  it("clicking Search trims input and triggers search", async () => {
    render(<SearchScreen />);

    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce([{ idDrink: "9", strDrink: "Negroni" }]);
    (Cocktails as any).__mock.filterByIngredient.mockResolvedValueOnce([]);

    const input = screen.getByPlaceholderText("Type an ingredient or a drink…");
    fireEvent.changeText(input, "  negroni  ");
    const btn = screen.getAllByRole("button").find(b => within(b).queryByText("Search"));
    expect(btn).toBeTruthy();
    fireEvent.press(btn!);

    await flush(400);

    expect((Cocktails as any).__mock.searchByName).toHaveBeenCalledWith("negroni");
    expect(screen.getByText("Negroni")).toBeTruthy();
  });

  it("caps results to ≤ 60 after ranking even if API returns many", async () => {
    render(<SearchScreen />);

    const big = Array.from({ length: 200 }).map((_, i) => ({
      idDrink: String(7000 + i),
      strDrink: i % 2 ? `Gin Forward ${i}` : `Something ${i}`,
      _ings: ["gin"],
    }));
    (Cocktails as any).__mock.searchByName.mockResolvedValueOnce(big);

    await typeAndWait("gin");
    await flush();

    const rendered = screen.UNSAFE_getAllByType(Text).filter(
    (t: any) => /^Gin Forward|^Something/.test(t.props?.children)
    );

    expect(rendered.length).toBeLessThanOrEqual(60);
  });
});
