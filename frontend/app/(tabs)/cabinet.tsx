import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Platform,
  UIManager,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "@/components/ui/BackButton";
import { DarkTheme as Colors } from "@/components/ui/ColorPalette";
import { normalizeIngredient } from "../utils/normalize";
import { ingredientImageUrl } from "../utils/cocktaildb";
import { loadIngredientCatalog } from "../utils/ingredientCatalog";

// Components
import Chip from "@/components/my-ingredients/Chip";
import Tab from "@/components/my-ingredients/Tab";
import SearchBar from "@/components/my-ingredients/Searchbar";
import Toast from "@/components/my-ingredients/Toast";
import ActionSheet from "@/components/my-ingredients/ActionSheet";
import CabinetRow, { type Category } from "@/components/my-ingredients/CabinetRow";
import ShoppingRow from "@/components/my-ingredients/ShoppingRow";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** ---------- Types */
export type Ingredient = {
  id: string;
  name: string;
  category: Category;
  owned: boolean;
  wanted?: boolean;
  impactScore?: number;
  imageUrl?: string;
  /** 0..1 fraction remaining. default 1 (full). */
  qty?: number;
};

const STORAGE_KEY = "@mixology:cabinet_v1";

/** ---------- Main Screen Component ---------- */
export default function MyIngredientsScreen() {
  const insets = useSafeAreaInsets();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState<"cabinet" | "shopping">("cabinet");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");

  const [toast, setToast] = useState<{ text: string; onUndo: () => void } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Sheet & rename
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingItem, setRenamingItem] = useState<Ingredient | null>(null);
  const [newName, setNewName] = useState("");

  // local persistence state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // adding new ingredient
  const [addVisible, setAddVisible] = useState(false);
  const [catalog, setCatalog] = useState<{ name: string }[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [qty, setQty] = useState(1); // stepper in Add modal (1 = full)

  /** ----- Persistence ----- */
  useEffect(() => {
    void (async () => { 
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Ingredient[];
          setIngredients(parsed.map(i => ({ ...i, qty: typeof i.qty === "number" ? i.qty : 1 })));
        }
      } catch (e) {
        console.warn("Failed to load cabinet:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      void (async () => {             
        try {
          setSaving(true);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
        } catch (e) {
          console.warn("Failed to save cabinet:", e);
        } finally {
          setSaving(false);
        }
      })();
    }, 250);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [ingredients, loading]);

  /** ----- Derived data ----- */
  const ownedCount = useMemo(() => ingredients.filter((i) => i.owned).length, [ingredients]);
  const wantedCount = useMemo(() => ingredients.filter((i) => i.wanted).length, [ingredients]);

  const categories: ("All" | Category)[] = useMemo(() => {
    const set = new Set<Category>();
    ingredients.forEach((i) => set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [ingredients]);

  const sortByName = useCallback(
    (list: Ingredient[]) => {
      const out = [...list].sort((a, b) => a.name.localeCompare(b.name));
      return sortAsc ? out : out.reverse();
    },
    [sortAsc]
  );

  const filterByQueryAndCategory = useCallback(
    (list: Ingredient[]) => {
      let out = list;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        out = out.filter((i) => i.name.toLowerCase().includes(q));
      }
      if (categoryFilter !== "All") out = out.filter((i) => i.category === categoryFilter);
      return out;
    },
    [query, categoryFilter]
  );

  const cabinetItems = useMemo(
    () => sortByName(filterByQueryAndCategory(ingredients.filter((i) => i.owned))),
    [ingredients, sortByName, filterByQueryAndCategory]
  );

  const shoppingItems = useMemo(
    () => sortByName(filterByQueryAndCategory(ingredients.filter((i) => i.wanted))),
    [ingredients, sortByName, filterByQueryAndCategory]
  );

  /** ----- Actions ----- */
  const clearQuery = () => setQuery("");

  const toggleWanted = (id: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, wanted: !i.wanted } : i)));

  const onPressAdd = async () => {
    setAddVisible(true);
    if (!catalog.length && !catalogLoading) {
      setCatalogLoading(true);
      try {
        setCatalog(await loadIngredientCatalog());
      } finally {
        setCatalogLoading(false);
      }
    }
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const removed = prev[idx];
      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      setToast({
        text: `Deleted “${removed.name}”`,
        onUndo: () => {
          setIngredients((prev2) => {
            const exists = prev2.some((x) => x.id === removed.id);
            return exists ? prev2 : [...prev2.slice(0, idx), removed, ...prev2.slice(idx)];
          });
          setToast(null);
        },
      });
      return next;
    });
  };

  const addToShopping = (id: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, wanted: true } : i)));

  const removeFromCabinet = (id: string) => {
    const removed = ingredients.find((i) => i.id === id);
    if (!removed) return;
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, owned: false } : i)));
    setToast({
      text: `Removed “${removed.name}” from Cabinet`,
      onUndo: () => {
        setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, owned: true } : i)));
        setToast(null);
      },
    });
  };

  const removeFromShopping = (id: string) => {
    const removed = ingredients.find((i) => i.id === id);
    if (!removed) return;
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, wanted: false } : i)));
    setToast({
      text: `Removed “${removed.name}” from Shopping`,
      onUndo: () => {
        setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, wanted: true } : i)));
        setToast(null);
      },
    });
  };

  // NEW: qty adjust handler (clamp & round to 2 decimals)
  const adjustQty = useCallback((id: string, nextQty: number) => {
    const clamped = Math.max(0, Math.min(1, nextQty));
    const rounded = Math.round(clamped * 100) / 100;
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, qty: rounded } : i)));
  }, []);

  const markPurchasedSingle = (id: string) => {
    const it = ingredients.find((i) => i.id === id);
    if (!it) return;
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, wanted: false, owned: true, qty: 1 } : i
      )
    );
    setToast({
      text: `Marked “${it.name}” as purchased`,
      onUndo: () => {
        setIngredients((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, wanted: true, owned: false, qty: it.qty ?? 1 } : i
          )
        );
        setToast(null);
      },
    });
  };

  const markPurchased = () => {
    if (shoppingItems.length === 0) return;
    setIngredients((prev) =>
      prev.map((i) => (i.wanted ? { ...i, wanted: false, owned: true, qty: 1 } : i))
    );
  };

  const handleRename = (id: string) => {
    const it = ingredients.find((i) => i.id === id);
    if (!it) return;
    setRenamingItem(it);
    setNewName(it.name);
    setRenameModalVisible(true);
    setIsSheetOpen(false);
    setOpenMenuForId(null);
  };

  const confirmRename = () => {
    if (!renamingItem || !newName.trim()) return;
    const trimmed = newName.trim();
    const { displayName, canonicalName } = normalizeIngredient(trimmed);
    if (trimmed === renamingItem.name) {
      setRenameModalVisible(false);
      setRenamingItem(null);
      setNewName("");
      return;
    }
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === renamingItem.id
          ? {
              ...i,
              name: displayName,
              imageUrl: ingredientImageUrl(canonicalName || displayName, "Small"),
            }
          : i
      )
    );
    setToast({
      text: `Renamed "${renamingItem.name}" to "${trimmed}"`,
      onUndo: () => {
        setIngredients((prev) =>
          prev.map((i) => (i.id === renamingItem.id ? { ...i, name: renamingItem.name } : i))
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
      // @ts-ignore numeric timeout in RN
      toastTimerRef.current = setTimeout(() => setToast(null), 5000) as unknown as number;
    }
    return () => {
      if (toastTimerRef.current)
        clearTimeout(toastTimerRef.current as unknown as number);
    };
  }, [toast]);

  /** ----- Renderers ----- */
  const renderCabinetItem = ({ item }: { item: Ingredient }) => (
    <CabinetRow
      item={item}
      onToggleMenu={(id) => {
        setOpenMenuForId(id);
        setIsSheetOpen(true);
      }}
      onAddToShopping={addToShopping}
      onRemoveFromCabinet={removeFromCabinet}
      onAdjustQty={adjustQty} // << integrate qty control
    />
  );

  const renderShoppingItem = ({ item }: { item: Ingredient }) => (
    <ShoppingRow
      item={item}
      onToggleMenu={(id) => {
        setOpenMenuForId(id);
        setIsSheetOpen(true);
      }}
      onToggleWanted={toggleWanted}
    />
  );

  const renderEmpty = (title: string, subtitle: string, icon?: string) => (
    <View style={styles.emptyWrap}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );

  /** ----- Views ----- */
  const CabinetView = (
    <>
      <SearchBar value={query} onChangeText={setQuery} onClear={clearQuery} />

      <View style={styles.filtersRow}>
        <View style={styles.categoriesWrap}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </View>
        <Chip label={sortAsc ? "A–Z" : "Z–A"} active onPress={() => setSortAsc((s) => !s)} />
      </View>

      <FlatList
        style={styles.list}
        data={cabinetItems}
        keyExtractor={(i) => i.id}
        renderItem={renderCabinetItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        ListEmptyComponent={renderEmpty(
          query ? "No matches" : "Cabinet is empty",
          query ? `No ingredients match "${query}".` : "Add your first items using the ＋ button.",
          query ? "🔍" : "🍸"
        )}
        onScrollBeginDrag={() => {
          setIsSheetOpen(false);
          setOpenMenuForId(null);
        }}
      />
    </>
  );

  const ShoppingView = (
    <>
      <SearchBar value={query} onChangeText={setQuery} onClear={clearQuery} />

      <View style={styles.filtersRow}>
        <TouchableOpacity
          onPress={markPurchased}
          style={[styles.primaryBtn, shoppingItems.length === 0 && { opacity: 0.5 }]}
          disabled={shoppingItems.length === 0}
        >
          <Text style={styles.primaryBtnText}>Mark purchased</Text>
        </TouchableOpacity>
        <View style={styles.categoriesWrap}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onPress={() => setCategoryFilter(cat)}
            />
          ))}
        </View>
        <Chip label={sortAsc ? "A–Z" : "Z–A"} active onPress={() => setSortAsc((s) => !s)} />
      </View>

      <FlatList
        style={styles.list}
        data={shoppingItems}
        keyExtractor={(i) => i.id}
        renderItem={renderShoppingItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        ListEmptyComponent={renderEmpty(
          query ? "No matches" : "No items",
          query ? `No items match "${query}".` : "Add items to your Shopping List using the ＋ button.",
          query ? "🔍" : "🛒"
        )}
        onScrollBeginDrag={() => {
          setIsSheetOpen(false);
          setOpenMenuForId(null);
        }}
      />
    </>
  );

  const sheetActions =
    !openMenuForId
      ? []
      : activeTab === "cabinet"
      ? [
          { label: "Rename", onPress: () => handleRename(openMenuForId) },
          { label: "Delete", danger: true, onPress: () => deleteIngredient(openMenuForId) },
        ]
      : [
          { label: "Rename", onPress: () => handleRename(openMenuForId) },
          { label: "Mark Purchased", onPress: () => markPurchasedSingle(openMenuForId) },
          { label: "Remove from Shopping", danger: true, onPress: () => removeFromShopping(openMenuForId) },
          { label: "Delete", danger: true, onPress: () => deleteIngredient(openMenuForId) },
        ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back button overlay like Favorites */}
      <View style={[styles.backWrap, { top: Math.max(14, insets.top) }]}>
        <BackButton />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Centered page header like Favorites */}
        <View style={[styles.headerWrap, { paddingTop: insets.top + 56 }]}>
          <Text style={styles.title}>My Cabinet</Text>
          {loading ? (
            <Text style={styles.subtle}>Loading…</Text>
          ) : saving ? (
            <Text style={styles.subtle}>Saving…</Text>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <Tab
            label={`Owned (${ownedCount})`}
            active={activeTab === "cabinet"}
            onPress={() => setActiveTab("cabinet")}
          />
          <Tab
            label={`Shopping List (${wantedCount})`}
            active={activeTab === "shopping"}
            onPress={() => setActiveTab("shopping")}
          />
        </View>
        <View style={styles.body}>{activeTab === "cabinet" ? CabinetView : ShoppingView}</View>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => { void onPressAdd(); }} 
          activeOpacity={0.85}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>

        {/* Toast */}
        {toast && <Toast text={toast.text} onUndo={toast.onUndo} />}

        {/* Action sheet */}
        <ActionSheet
          visible={isSheetOpen && !!openMenuForId}
          onClose={() => {
            setIsSheetOpen(false);
            setOpenMenuForId(null);
          }}
          actions={sheetActions}
        />

        {/* Rename Modal */}
        <Modal visible={renameModalVisible} transparent animationType="fade" onRequestClose={cancelRename}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename Ingredient</Text>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
                placeholderTextColor="#8B8B8B"
                autoFocus
                selectTextOnFocus
                onSubmitEditing={confirmRename}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={cancelRename} style={[styles.modalButton, styles.modalButtonCancel]}>
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmRename}
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  disabled={!newName.trim()}
                >
                  <Text
                    style={[styles.modalButtonTextConfirm, !newName.trim() && styles.modalButtonTextDisabled]}
                  >
                    Rename
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Ingredient Modal */}
        <Modal visible={addVisible} transparent animationType="fade" onRequestClose={() => setAddVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 420 }]}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>

              {/* Search input */}
              <TextInput
                value={addQuery}
                onChangeText={setAddQuery}
                placeholder="Search CocktailDB (e.g., Gin, Triple Sec, Lime)"
                placeholderTextColor="#8B8B8B"
                style={styles.modalInput}
              />

              {/* Quantity stepper (interpreted as fraction of a bottle: 1 = full) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#CFCFCF", fontWeight: "600" }}>Quantity</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setQty(Math.max(0, qty - 0.25))}
                    style={[styles.modalButton, { paddingHorizontal: 12 }]}
                  >
                    <Text style={{ color: "#CFCFCF", fontSize: 18 }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ color: "#fff", minWidth: 48, textAlign: "center" }}>
                    {Math.round(Math.max(0, Math.min(1, qty)) * 100)}%
                  </Text>
                  <TouchableOpacity
                    onPress={() => setQty(Math.min(1, qty + 0.25))}
                    style={[styles.modalButton, { paddingHorizontal: 12 }]}
                  >
                    <Text style={{ color: "#CFCFCF", fontSize: 18 }}>＋</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Results list */}
              <View style={{ maxHeight: 340 }}>
                {catalogLoading ? (
                  <Text style={{ color: "#9BA3AF" }}>Loading catalog…</Text>
                ) : (
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={catalog.filter((c) =>
                      c.name.toLowerCase().includes(addQuery.trim().toLowerCase())
                    )}
                    keyExtractor={(i) => i.name}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          const id = `${Date.now()}`;
                          const { displayName, canonicalName } = normalizeIngredient(item.name);
                          const name = displayName;
                          setIngredients((prev) => [
                            ...prev,
                            {
                              id,
                              name,
                              category: "Other",
                              owned: true,
                              wanted: false,
                              impactScore: Math.random(),
                              imageUrl: ingredientImageUrl(canonicalName || name, "Small"),
                              qty: Math.max(0, Math.min(1, qty)), // save fraction
                            },
                          ]);
                          setAddVisible(false);
                          setAddQuery("");
                          setQty(1);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#232329",
                          marginBottom: 8,
                          backgroundColor: "#141418",
                        }}
                      >
                        <Image
                          source={{ uri: ingredientImageUrl(item.name, "Small") }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            marginRight: 12,
                            backgroundColor: "#26262B",
                            borderWidth: 1,
                            borderColor: "#2C2C34",
                          }}
                        />
                        <Text style={{ color: "#EAEAEA", fontWeight: "600", flex: 1 }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={{ color: "#9BA3AF", fontSize: 12 }}>Tap to add</Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    overScrollMode="never"
                  />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setAddVisible(false)}
                  style={[styles.modalButton, styles.modalButtonCancel]}
                >
                  <Text style={styles.modalButtonTextCancel}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, overflow: "visible" },
  body: { flex: 1 },
  list: { flex: 1, overflow: "visible" },
  headerWrap: { backgroundColor: Colors.background, alignItems: "center" },
  backWrap: { position: "absolute", left: 14, zIndex: 10 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.textPrimary, textAlign: "center", marginBottom: 4 },
  subtle: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 12, marginBottom: 8 },

  tabsRow: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8, gap: 8 },

  sectionHeader: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, letterSpacing: -0.2 },
  sectionSub: { marginTop: 6, fontSize: 14, color: Colors.textSecondary ?? "#9BA3AF", fontWeight: "500" },

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

  listContent: { paddingHorizontal: 10, paddingBottom: 120, paddingTop: 10, flexGrow: 1 },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.6 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { color: Colors.textSecondary ?? "#9BA3AF", fontSize: 14, textAlign: "center", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accentPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accentPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.accentPrimary,
  },
  fabPlus: { color: "#FFFFFF", fontSize: 30, marginTop: -2, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "#2C2C34",
  },
  modalTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" },
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
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  modalButtonCancel: { backgroundColor: "transparent", borderColor: "#2A2A30" },
  modalButtonConfirm: { backgroundColor: Colors.accentPrimary, borderColor: Colors.accentPrimary },
  modalButtonTextCancel: { color: "#CFCFCF", fontSize: 16, fontWeight: "600" },
  modalButtonTextConfirm: { color: Colors.accentContrast, fontSize: 16, fontWeight: "700" },
  modalButtonTextDisabled: { color: "#8B8B8B" },
});
