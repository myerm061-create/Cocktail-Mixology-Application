// my-ingredients.tsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

/** ---------- Types & Demo Data ---------- */
type Category = "Spirit" | "Liqueur" | "Mixer" | "Juice" | "Garnish" | "Other";

type Ingredient = {
  id: string;
  name: string;
  category: Category;
  owned: boolean;
  wanted?: boolean;
  impactScore?: number;
};

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "1",  name: "Gin (London Dry)",       category: "Spirit",  owned: true,  impactScore: 0.92 },
  { id: "2",  name: "Vodka",                  category: "Spirit",  owned: false, impactScore: 0.88 },
  { id: "3",  name: "Tequila (Blanco)",       category: "Spirit",  owned: true,  impactScore: 0.86 },
  { id: "4",  name: "White Rum",              category: "Spirit",  owned: false, impactScore: 0.84 },
  { id: "5",  name: "Sweet Vermouth",         category: "Liqueur", owned: true,  impactScore: 0.70 },
  { id: "6",  name: "Triple Sec / Cointreau", category: "Liqueur", owned: false, impactScore: 0.90 },
  { id: "7",  name: "Angostura Bitters",      category: "Other",   owned: true,  impactScore: 0.65 },
  { id: "8",  name: "Simple Syrup",           category: "Mixer",   owned: true,  impactScore: 0.78 },
  { id: "9",  name: "Club Soda",              category: "Mixer",   owned: false, impactScore: 0.66 },
  { id: "10", name: "Lime Juice",             category: "Juice",   owned: true,  impactScore: 0.76 },
  { id: "11", name: "Lemon Juice",            category: "Juice",   owned: false, impactScore: 0.72 },
  { id: "12", name: "Mint Leaves",            category: "Garnish", owned: true,  impactScore: 0.60 },
];

/** ---------- UI Primitives ---------- */
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabActive : styles.tabIdle]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SearchBar({
  value,
  onChangeText,
  onClear,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.searchWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search ingredients…"
        placeholderTextColor="#8B8B8B"
        style={styles.searchInput}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.searchClear}>
          <Text style={styles.searchClearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

function Toast({ text, onUndo }: { text: string; onUndo: () => void }) {
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText} numberOfLines={1}>
        {text}
      </Text>
      <TouchableOpacity onPress={onUndo} style={styles.toastButton}>
        <Text style={styles.toastButtonText}>Undo</Text>
      </TouchableOpacity>
    </View>
  );
}

/** ---------- Pretty ActionSheet (drop-in, matches your style) ---------- */
function ActionSheet({
  visible,
  onClose,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  actions: { label: string; danger?: boolean; onPress: () => void }[];
}) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        {/* Grab handle */}
        <View style={styles.sheetHandleWrap}>
          <View style={styles.sheetHandle} />
        </View>

        {actions.map((a, i) => (
          <Pressable
            key={i}
            onPress={() => {
              onClose();
              a.onPress();
            }}
            style={({ pressed }) => [
              styles.sheetItem,
              pressed && { backgroundColor: "#202028" },
            ]}
          >
            <Text
              style={[
                styles.sheetItemText,
                a.danger && { color: "#FF8A99" },
              ]}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}

        <View style={styles.menuDivider} />

        <Pressable onPress={onClose} style={styles.sheetItem}>
          <Text style={styles.sheetCancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

/** ---------- Row Components ---------- */
function CabinetRow({
  item,
  isMenuOpen,
  onToggleMenu,
  onAddToShopping,
  onRemoveFromCabinet,
  onRename,
}: {
  item: Ingredient;
  isMenuOpen: boolean; // kept for compatibility (not used by sheet)
  onToggleMenu: (id: string) => void;
  onAddToShopping: (id: string) => void;
  onRemoveFromCabinet: (id: string) => void;
  onRename: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const handleOpen = (direction: "left" | "right") => {
    if (direction === "left") onAddToShopping(item.id);
    else if (direction === "right") onRemoveFromCabinet(item.id);
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={() => (
        <View style={[styles.actionLeft, styles.actionAdd]}>
          <Text style={styles.actionText}>Add to Cart</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.actionRight, styles.actionRemove]}>
          <Text style={styles.actionText}>Remove</Text>
        </View>
      )}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      onSwipeableOpen={handleOpen}
      // important so any sibling overlay can escape
      childrenContainerStyle={{ overflow: "visible" }}
    >
      {/* transparent wrapper so overlays aren't clipped by rounded card */}
      <View style={styles.rowWrap}>
        <View style={styles.rowCard}>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.rowSub} numberOfLines={1}>{item.category}</Text>
          </View>

          <Pressable
            onPress={() => onToggleMenu(item.id)}
            accessibilityLabel="More actions"
            style={styles.menuButton}
          >
            <Text style={styles.menuDots}>⋯</Text>
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
}

function ShoppingRow({
  item,
  isMenuOpen,
  onToggleMenu,
  onToggleWanted,
  onRename,
  onMarkPurchased,
  onRemoveFromShopping,
}: {
  item: Ingredient;
  isMenuOpen: boolean; // kept for compatibility (not used by sheet)
  onToggleMenu: (id: string) => void;
  onToggleWanted: (id: string) => void;
  onRename: (id: string) => void;
  onMarkPurchased: (id: string) => void;
  onRemoveFromShopping: (id: string) => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onToggleWanted(item.id)}
        style={[styles.checkbox, item.wanted && styles.checkboxChecked]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!item.wanted }}
      >
        {item.wanted ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </Pressable>

      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.category}
        </Text>
      </View>

      {/* Trailing overflow button (sheet opens from parent) */}
      <Pressable
        onPress={() => onToggleMenu(item.id)}
        accessibilityLabel="More actions"
        style={styles.menuButton}
      >
        <Text style={styles.menuDots}>⋯</Text>
      </Pressable>
    </View>
  );
}

/** ---------- Main Screen Component ---------- */
export default function MyIngredientsScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [activeTab, setActiveTab] = useState<"cabinet" | "shopping">("cabinet");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [toast, setToast] = useState<{ text: string; onUndo: () => void } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Shared “which row” state
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  // Sheet visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Rename functionality
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingItem, setRenamingItem] = useState<Ingredient | null>(null);
  const [newName, setNewName] = useState("");

  /** ----- Derived data ----- */
  const ownedCount  = useMemo(() => ingredients.filter(i => i.owned).length, [ingredients]);
  const wantedCount = useMemo(() => ingredients.filter(i => i.wanted).length, [ingredients]);

  const categories: ("All" | Category)[] = useMemo(() => {
    const set = new Set<Category>();
    ingredients.forEach(i => set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [ingredients]);

  const sortByName = (list: Ingredient[]) => {
    return [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
  };

  const filterByQueryAndCategory = (list: Ingredient[]) => {
    let filteredList = list;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filteredList = filteredList.filter(item => item.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      filteredList = filteredList.filter(item => item.category === categoryFilter);
    }
    return filteredList;
  };

  const cabinetItems = useMemo(() => {
    const list = ingredients.filter(item => item.owned);
    return sortByName(filterByQueryAndCategory(list));
  }, [ingredients, query, categoryFilter, sortAsc]);

  const shoppingItems = useMemo(() => {
    const list = ingredients.filter(item => item.wanted);
    return sortByName(filterByQueryAndCategory(list));
  }, [ingredients, query, categoryFilter, sortAsc]);

  const suggestions = useMemo(() => {
    const pool = ingredients.filter(item => !item.owned && !item.wanted);
    const ranked = [...pool].sort((a, b) => (b.impactScore ?? 0) - (a.impactScore ?? 0));
    return ranked.slice(0, 6);
  }, [ingredients]);

  /** ----- Actions ----- */
  const clearQuery = () => setQuery("");

  const toggleWanted = (id: string) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, wanted: !item.wanted } : item)),
    );
  };

  const onPressAdd = () => {
    const id = (ingredients.length + 1).toString();
    setIngredients(prev => [
      ...prev,
      {
        id,
        name: activeTab === "cabinet" ? `New Ingredient #${id}` : `Needed Ingredient #${id}`,
        category: "Other",
        owned: activeTab === "cabinet",
        wanted: activeTab === "shopping",
        impactScore: Math.random(),
      },
    ]);
  };

  const addToShopping = (id: string) => {
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, wanted: true } : item)),
    );
  };

  const removeFromCabinet = (id: string) => {
    const removed = ingredients.find(item => item.id === id);
    if (!removed) return;
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, owned: false } : item)),
    );
    setToast({
      text: `Removed “${removed.name}” from Cabinet`,
      onUndo: () => {
        setIngredients(prev =>
          prev.map(item => (item.id === id ? { ...item, owned: true } : item)),
        );
        setToast(null);
      },
    });
  };

  const removeFromShopping = (id: string) => {
    const removed = ingredients.find(item => item.id === id);
    if (!removed) return;
    setIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, wanted: false } : item)),
    );
    setToast({
      text: `Removed “${removed.name}” from Shopping`,
      onUndo: () => {
        setIngredients(prev =>
          prev.map(item => (item.id === id ? { ...item, wanted: true } : item)),
        );
        setToast(null);
      },
    });
  };

  const markPurchasedSingle = (id: string) => {
    const item = ingredients.find(i => i.id === id);
    if (!item) return;
    setIngredients(prev =>
      prev.map(i =>
        i.id === id ? { ...i, wanted: false, owned: true } : i
      ),
    );
    setToast({
      text: `Marked “${item.name}” as purchased`,
      onUndo: () => {
        setIngredients(prev =>
          prev.map(i =>
            i.id === id ? { ...i, wanted: true, owned: false } : i
          ),
        );
        setToast(null);
      },
    });
  };

  const markPurchased = () => {
    if (shoppingItems.length === 0) return;
    setIngredients(prev =>
      prev.map(item =>
        item.wanted ? { ...item, wanted: false, owned: true } : item,
      ),
    );
  };

  const handleRename = (id: string) => {
    const item = ingredients.find(i => i.id === id);
    if (item) {
      setRenamingItem(item);
      setNewName(item.name);
      setRenameModalVisible(true);
      setIsSheetOpen(false);
      setOpenMenuForId(null);
    }
  };

  const confirmRename = () => {
    if (!renamingItem || !newName.trim()) return;

    const trimmedName = newName.trim();
    if (trimmedName === renamingItem.name) {
      setRenameModalVisible(false);
      setRenamingItem(null);
      setNewName("");
      return;
    }

    setIngredients(prev =>
      prev.map(item =>
        item.id === renamingItem.id ? { ...item, name: trimmedName } : item,
      ),
    );

    setToast({
      text: `Renamed "${renamingItem.name}" to "${trimmedName}"`,
      onUndo: () => {
        setIngredients(prev =>
          prev.map(item =>
            item.id === renamingItem.id ? { ...item, name: renamingItem.name } : item,
          ),
        );
        setToast(null);
      },
    });

    setRenameModalVisible(false);
    setRenamingItem(null);
    setNewName("");
  };

  const cancelRename = () => {
    setRenameModalVisible(false);
    setRenamingItem(null);
    setNewName("");
  };

  // Toast lifecycle
  useEffect(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current as unknown as number);
      toastTimerRef.current = null;
    }
    if (toast) {
      // @ts-ignore - RN numeric timeout
      toastTimerRef.current = setTimeout(() => setToast(null), 5000) as unknown as number;
    }
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current as unknown as number);
        toastTimerRef.current = null;
      }
    };
  }, [toast]);

  /** ----- Renderers (no hooks inside) ----- */
  const renderCabinetItem = ({ item }: { item: Ingredient }) => (
    <CabinetRow
      item={item}
      isMenuOpen={openMenuForId === item.id}
      onToggleMenu={(id) => {
        setOpenMenuForId(id);
        setIsSheetOpen(true);
      }}
      onAddToShopping={addToShopping}
      onRemoveFromCabinet={removeFromCabinet}
      onRename={handleRename}
    />
  );

  const renderShoppingItem = ({ item }: { item: Ingredient }) => (
    <ShoppingRow
      item={item}
      isMenuOpen={openMenuForId === item.id}
      onToggleMenu={(id) => {
        setOpenMenuForId(id);
        setIsSheetOpen(true);
      }}
      onToggleWanted={toggleWanted}
      onRename={handleRename}
      onMarkPurchased={markPurchasedSingle}
      onRemoveFromShopping={removeFromShopping}
    />
  );

  const renderEmpty = (title: string, subtitle: string) => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  /** ----- Views ----- */
  const CabinetView = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>My Cabinet</Text>
        <Text style={styles.subtitle}>{ownedCount} owned</Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} onClear={clearQuery} />

      <View style={styles.filtersRow}>
        <View style={styles.categoriesWrap}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </View>
        <Chip
          label={sortAsc ? "A–Z" : "Z–A"}
          active
          onPress={() => setSortAsc(s => !s)}
        />
      </View>

      <FlatList
        data={cabinetItems}
        keyExtractor={item => item.id}
        renderItem={renderCabinetItem}
        contentContainerStyle={[
          styles.listContent,
          cabinetItems.length === 0 && { flex: 1 },
        ]}
        style={{ overflow: "visible" }}
        ListEmptyComponent={renderEmpty(
          query ? "No matches" : "Cabinet is empty",
          query
            ? `No ingredients match "${query}".`
            : "Add your first items using the ＋ button.",
        )}
        // Close sheet when scrolling
        onScrollBeginDrag={() => {
          setIsSheetOpen(false);
          setOpenMenuForId(null);
        }}
      />
    </>
  );

  const ShoppingView = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <Text style={styles.subtitle}>{wantedCount} items</Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} onClear={clearQuery} />

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.sectionTitle}>Smart Suggestions</Text>
            <Pressable onPress={() => setShowSuggestions(false)}>
              <Text style={styles.linkText}>Hide</Text>
            </Pressable>
          </View>
          <Text style={styles.suggestionSub}>
            High-impact additions that unlock the most drinks.
          </Text>
          <View style={styles.suggestionChips}>
            {suggestions.map(sug => (
              <Pressable
                key={sug.id}
                style={styles.suggestionChip}
                onPress={() => addToShopping(sug.id)}
              >
                <Text style={styles.suggestionChipText} numberOfLines={1}>
                  {sug.name}
                </Text>
                <Text style={styles.suggestionScore}>
                  {(sug.impactScore ?? 0).toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.filtersRow}>
        <TouchableOpacity
          onPress={markPurchased}
          style={[styles.primaryBtn, shoppingItems.length === 0 && { opacity: 0.5 }]}
          disabled={shoppingItems.length === 0}
        >
          <Text style={styles.primaryBtnText}>Mark purchased</Text>
        </TouchableOpacity>
        <View style={styles.categoriesWrap}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </View>
        <Chip
          label={sortAsc ? "A–Z" : "Z–A"}
          active
          onPress={() => setSortAsc(s => !s)}
        />
      </View>

      <FlatList
        data={shoppingItems}
        keyExtractor={item => item.id}
        renderItem={renderShoppingItem}
        contentContainerStyle={[
          styles.listContent,
          shoppingItems.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={renderEmpty(
          query ? "No matches" : "No items",
          query
            ? `No items match “${query}”.`
            : "Add items to your Shopping List using the ＋ button or from Smart Suggestions.",
        )}
        onScrollBeginDrag={() => {
          setIsSheetOpen(false);
          setOpenMenuForId(null);
        }}
      />
    </>
  );

  // Build sheet actions depending on tab
  const sheetActions =
    !openMenuForId
      ? []
      : activeTab === "cabinet"
      ? [
          { label: "Rename", onPress: () => handleRename(openMenuForId) },
        ]
      : [
          { label: "Rename", onPress: () => handleRename(openMenuForId) },
          { label: "Mark Purchased", onPress: () => markPurchasedSingle(openMenuForId) },
          { label: "Remove from Shopping", danger: true, onPress: () => removeFromShopping(openMenuForId) },
        ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <Tab
          label={`Cabinet (${ownedCount})`}
          active={activeTab === "cabinet"}
          onPress={() => setActiveTab("cabinet")}
        />
        <Tab
          label={`Shopping (${wantedCount})`}
          active={activeTab === "shopping"}
          onPress={() => setActiveTab("shopping")}
        />
      </View>

      {activeTab === "cabinet" ? CabinetView : ShoppingView}

      <TouchableOpacity style={styles.fab} onPress={onPressAdd} activeOpacity={0.85}>
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {toast && (
        <Toast
          text={toast.text}
          onUndo={toast.onUndo}
        />
      )}

      {/* Replaces global/local popovers */}
      <ActionSheet
        visible={isSheetOpen && !!openMenuForId}
        onClose={() => {
          setIsSheetOpen(false);
          setOpenMenuForId(null);
        }}
        actions={sheetActions}
      />

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRename}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Ingredient</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              placeholderTextColor="#8B8B8B"
              autoFocus={true}
              selectTextOnFocus={true}
              onSubmitEditing={confirmRename}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={cancelRename}
                style={[styles.modalButton, styles.modalButtonCancel]}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRename}
                style={[styles.modalButton, styles.modalButtonConfirm]}
                disabled={!newName.trim()}
              >
                <Text style={[
                  styles.modalButtonTextConfirm,
                  !newName.trim() && styles.modalButtonTextDisabled
                ]}>
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E10",
    overflow: "visible",
  },
  // Tabs
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  tabIdle: {
    backgroundColor: "#121216",
    borderColor: "#22222A",
  },
  tabActive: {
    backgroundColor: "#1C1C22",
    borderColor: "#3A3A42",
  },
  tabText: {
    color: "#CFCFCF",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  // Header
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5F0E1",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#A9A9A9",
  },
  // Search
  searchWrap: {
    marginTop: 8,
    paddingHorizontal: 20,
    position: "relative",
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1A1A1E",
    color: "#EAEAEA",
    borderWidth: 1,
    borderColor: "#232329",
  },
  searchClear: {
    position: "absolute",
    right: 28,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchClearText: {
    color: "#A9A9A9",
    fontSize: 20,
    lineHeight: 20,
  },
  // Filters
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 8,
  },
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 8,
    columnGap: 8,
    flexShrink: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 0,
  },
  chipIdle: {
    backgroundColor: "transparent",
    borderColor: "#2A2A30",
  },
  chipActive: {
    backgroundColor: "#1F1F24",
    borderColor: "#3A3A42",
  },
  chipText: {
    fontSize: 13,
    color: "#CFCFCF",
    maxWidth: 120,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // List
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 120,
    paddingTop: 10,
    overflow: "visible",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    marginVertical: 4,
    backgroundColor: "#141419",
    borderWidth: 1,
    borderColor: "#232329",
    borderRadius: 14,
    position: "relative",
    overflow: "visible",
  },
  rowWrap: {
    position: "relative",
    marginHorizontal: 6,
    marginVertical: 4,
    overflow: "visible",
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#141419",
    borderWidth: 1,
    borderColor: "#232329",
    borderRadius: 14,
    position: "relative",
    overflow: "visible",
  },
  rowTextWrap: {
    flex: 1,
    marginRight: 8,
    overflow: "hidden",
  },
  rowTitle: {
    color: "#EDEDED",
    fontSize: 16,
    fontWeight: "600",
  },
  rowSub: {
    color: "#9C9CA3",
    fontSize: 12,
    marginTop: 2,
  },
  // Checkbox (Shopping)
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#3C3C46",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#3B7BFF",
    borderColor: "#3B7BFF",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#A9A9A9",
    fontSize: 14,
    textAlign: "center",
  },
  // Primary button (shopping)
  primaryBtn: {
    backgroundColor: "#3B7BFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#3B7BFF",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  // Smart suggestions
  suggestionCard: {
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 16,
    backgroundColor: "#17171C",
    borderWidth: 1,
    borderColor: "#272732",
    padding: 12,
    gap: 8,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionSub: {
    color: "#A9A9A9",
    fontSize: 12,
  },
  suggestionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1F1F24",
    borderWidth: 1,
    borderColor: "#30303A",
  },
  suggestionChipText: {
    color: "#EDEDED",
    fontWeight: "600",
    maxWidth: 180,
  },
  suggestionScore: {
    color: "#9C9CA3",
    fontSize: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    flex: 1,
  },
  linkText: {
    color: "#9DB4FF",
    fontWeight: "700",
    fontSize: 12,
  },

  // Swipe action visuals
  actionLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 14,
  },
  actionRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 14,
  },
  actionAdd: {
    backgroundColor: "#287D3C",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionRemove: {
    backgroundColor: "#7D2830",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Toast (undo)
  toastContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1C1C22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#32323C",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toastText: {
    color: "#EDEDED",
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  toastButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toastButtonText: {
    color: "#9DB4FF",
    fontWeight: "700",
    fontSize: 14,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B7BFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPlus: {
    color: "#FFFFFF",
    fontSize: 28,
    marginTop: -2,
    fontWeight: "600",
  },

  // Overflow button
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A2A30",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1E",
    marginLeft: 8,
    zIndex: 5,
  },
  menuDots: {
    color: "#CFCFCF",
    fontSize: 18,
    lineHeight: 18,
    marginTop: -2,
    fontWeight: "800",
  },

  // Bottom sheet (new)
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetContainer: {
    backgroundColor: "#16161B",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingBottom: 12,
    paddingTop: 6,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#2F2F3A",
  },
  sheetItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sheetItemText: {
    color: "#EDEDF7",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  sheetCancelText: {
    color: "#CFCFE6",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  // (Old popover styles kept for now; safe to delete if unused)
  menuPopover: {
    position: "absolute",
    right: -120,
    top: 45,
    minWidth: 140,
    backgroundColor: "#1C1C22",
    borderColor: "#2C2C34",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 1000,
  },
  globalMenuPopover: {
    position: "absolute",
    right: 20,
    top: "50%",
    minWidth: 140,
    backgroundColor: "#1C1C22",
    borderColor: "#2C2C34",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 1000,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemText: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#2C2C34",
    marginHorizontal: 8,
  },

  // Rename Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#1C1C22",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#2C2C34",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#1A1A1E",
    borderWidth: 1,
    borderColor: "#232329",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#EAEAEA",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  modalButtonCancel: {
    backgroundColor: "transparent",
    borderColor: "#2A2A30",
  },
  modalButtonConfirm: {
    backgroundColor: "#3B7BFF",
    borderColor: "#3B7BFF",
  },
  modalButtonTextCancel: {
    color: "#CFCFCF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalButtonTextDisabled: {
    color: "#8B8B8B",
  },
});
