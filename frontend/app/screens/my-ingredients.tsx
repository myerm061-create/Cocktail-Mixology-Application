import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Pressable, Modal } from "react-native";
import { Colors } from "@/constants/Colors";

// Components
import Chip from "@/components/my-ingredients/Chip";
import Tab from "@/components/my-ingredients/Tab";
import SearchBar from "@/components/my-ingredients/Searchbar"; 
import Toast from "@/components/my-ingredients/Toast";
import ActionSheet from "@/components/my-ingredients/ActionSheet";
import CabinetRow, { type Ingredient as CabinetIngredient, type Category } from "@/components/my-ingredients/CabinetRow";
import ShoppingRow from "@/components/my-ingredients/ShoppingRow";

/** ---------- Types & Demo Data ---------- */
type Ingredient = CabinetIngredient;
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

  // Sheet & rename
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingItem, setRenamingItem] = useState<Ingredient | null>(null);
  const [newName, setNewName] = useState("");

  /** ----- Derived data ----- */
  const ownedCount  = useMemo(() => ingredients.filter(i => i.owned).length, [ingredients]);
  const wantedCount = useMemo(() => ingredients.filter(i => i.wanted).length, [ingredients]);

  const categories: ("All" | Category)[] = useMemo(() => {
    const set = new Set<Category>(); ingredients.forEach(i => set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [ingredients]);

  const sortByName = (list: Ingredient[]) => {
    const out = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return sortAsc ? out : out.reverse();
  };
  const filterByQueryAndCategory = (list: Ingredient[]) => {
    let out = list;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(i => i.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") out = out.filter(i => i.category === categoryFilter);
    return out;
  };

  const cabinetItems  = useMemo(() => sortByName(filterByQueryAndCategory(ingredients.filter(i => i.owned))), [ingredients, query, categoryFilter, sortAsc]);
  const shoppingItems = useMemo(() => sortByName(filterByQueryAndCategory(ingredients.filter(i => i.wanted))), [ingredients, query, categoryFilter, sortAsc]);

  const suggestions = useMemo(() => {
    const pool = ingredients.filter(i => !i.owned && !i.wanted);
    return [...pool].sort((a,b) => (b.impactScore ?? 0) - (a.impactScore ?? 0)).slice(0,6);
  }, [ingredients]);

  /** ----- Actions ----- */
  const clearQuery = () => setQuery("");
  const toggleWanted = (id: string) =>
    setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: !i.wanted } : i)));

  const onPressAdd = () => {
    const id = (ingredients.length + 1).toString();
    setIngredients(prev => [...prev, {
      id,
      name: activeTab === "cabinet" ? `New Ingredient #${id}` : `Needed Ingredient #${id}`,
      category: "Other", owned: activeTab === "cabinet", wanted: activeTab === "shopping",
      impactScore: Math.random(),
    }]);
  };

  const addToShopping = (id: string) =>
    setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: true } : i)));

  const removeFromCabinet = (id: string) => {
    const removed = ingredients.find(i => i.id === id); if (!removed) return;
    setIngredients(prev => prev.map(i => (i.id === id ? { ...i, owned: false } : i)));
    setToast({
      text: `Removed “${removed.name}” from Cabinet`,
      onUndo: () => {
        setIngredients(prev => prev.map(i => (i.id === id ? { ...i, owned: true } : i)));
        setToast(null);
      },
    });
  };

  const removeFromShopping = (id: string) => {
    const removed = ingredients.find(i => i.id === id); if (!removed) return;
    setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: false } : i)));
    setToast({
      text: `Removed “${removed.name}” from Shopping`,
      onUndo: () => {
        setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: true } : i)));
        setToast(null);
      },
    });
  };

  const markPurchasedSingle = (id: string) => {
    const it = ingredients.find(i => i.id === id); if (!it) return;
    setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: false, owned: true } : i)));
    setToast({
      text: `Marked “${it.name}” as purchased`,
      onUndo: () => {
        setIngredients(prev => prev.map(i => (i.id === id ? { ...i, wanted: true, owned: false } : i)));
        setToast(null);
      },
    });
  };

  const markPurchased = () => {
    if (shoppingItems.length === 0) return;
    setIngredients(prev => prev.map(i => (i.wanted ? { ...i, wanted: false, owned: true } : i)));
  };

  const handleRename = (id: string) => {
    const it = ingredients.find(i => i.id === id); if (!it) return;
    setRenamingItem(it); setNewName(it.name); setRenameModalVisible(true); setIsSheetOpen(false); setOpenMenuForId(null);
  };

  const confirmRename = () => {
    if (!renamingItem || !newName.trim()) return;
    const trimmed = newName.trim(); if (trimmed === renamingItem.name) { setRenameModalVisible(false); setRenamingItem(null); setNewName(""); return; }
    setIngredients(prev => prev.map(i => (i.id === renamingItem.id ? { ...i, name: trimmed } : i)));
    setToast({
      text: `Renamed "${renamingItem.name}" to "${trimmed}"`,
      onUndo: () => {
        setIngredients(prev => prev.map(i => (i.id === renamingItem.id ? { ...i, name: renamingItem.name } : i)));
        setToast(null);
      },
    });
    setRenameModalVisible(false); setRenamingItem(null); setNewName("");
  };

  const cancelRename = () => { setRenameModalVisible(false); setRenamingItem(null); setNewName(""); };

  // Toast lifecycle
  useEffect(() => {
    if (toastTimerRef.current) { clearTimeout(toastTimerRef.current as unknown as number); toastTimerRef.current = null; }
    if (toast) {
      // @ts-ignore numeric timeout in RN
      toastTimerRef.current = setTimeout(() => setToast(null), 5000) as unknown as number;
    }
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current as unknown as number); };
  }, [toast]);

  /** ----- Renderers ----- */
  const renderCabinetItem = ({ item }: { item: Ingredient }) => (
    <CabinetRow
      item={item}
      onToggleMenu={(id) => { setOpenMenuForId(id); setIsSheetOpen(true); }}
      onAddToShopping={addToShopping}
      onRemoveFromCabinet={removeFromCabinet}
    />
  );

  const renderShoppingItem = ({ item }: { item: Ingredient }) => (
    <ShoppingRow
      item={item}
      onToggleMenu={(id) => { setOpenMenuForId(id); setIsSheetOpen(true); }}
      onToggleWanted={toggleWanted}
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
            <Chip key={cat} label={cat} active={categoryFilter === cat} onPress={() => setCategoryFilter(cat)} />
          ))}
        </View>
        <Chip label={sortAsc ? "A–Z" : "Z–A"} active onPress={() => setSortAsc(s => !s)} />
      </View>

      <FlatList
        data={cabinetItems}
        keyExtractor={i => i.id}
        renderItem={renderCabinetItem}
        contentContainerStyle={[styles.listContent, cabinetItems.length === 0 && { flex: 1 }]}
        style={{ overflow: "visible" }}
        ListEmptyComponent={renderEmpty(query ? "No matches" : "Cabinet is empty", query ? `No ingredients match "${query}".` : "Add your first items using the ＋ button.")}
        onScrollBeginDrag={() => { setIsSheetOpen(false); setOpenMenuForId(null); }}
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

      {/* (Optional) smart suggestions block is unchanged; add back here if desired */}

      <View style={styles.filtersRow}>
        <TouchableOpacity onPress={markPurchased} style={[styles.primaryBtn, shoppingItems.length === 0 && { opacity: 0.5 }]} disabled={shoppingItems.length === 0}>
          <Text style={styles.primaryBtnText}>Mark purchased</Text>
        </TouchableOpacity>
        <View style={styles.categoriesWrap}>
          {categories.map(cat => (
            <Chip key={cat} label={cat} active={categoryFilter === cat} onPress={() => setCategoryFilter(cat)} />
          ))}
        </View>
        <Chip label={sortAsc ? "A–Z" : "Z–A"} active onPress={() => setSortAsc(s => !s)} />
      </View>

      <FlatList
        data={shoppingItems}
        keyExtractor={i => i.id}
        renderItem={renderShoppingItem}
        contentContainerStyle={[styles.listContent, shoppingItems.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty(query ? "No matches" : "No items", query ? `No items match “${query}”.` : "Add items to your Shopping List using the ＋ button.")}
        onScrollBeginDrag={() => { setIsSheetOpen(false); setOpenMenuForId(null); }}
      />
    </>
  );

  const sheetActions =
    !openMenuForId
      ? []
      : activeTab === "cabinet"
      ? [{ label: "Rename", onPress: () => handleRename(openMenuForId) }]
      : [
          { label: "Rename", onPress: () => handleRename(openMenuForId) },
          { label: "Mark Purchased", onPress: () => markPurchasedSingle(openMenuForId) },
          { label: "Remove from Shopping", danger: true, onPress: () => removeFromShopping(openMenuForId) },
        ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <Tab label={`Cabinet (${ownedCount})`}  active={activeTab === "cabinet"}  onPress={() => setActiveTab("cabinet")} />
        <Tab label={`Shopping (${wantedCount})`} active={activeTab === "shopping"} onPress={() => setActiveTab("shopping")} />
      </View>

      {activeTab === "cabinet" ? CabinetView : ShoppingView}

      <TouchableOpacity style={styles.fab} onPress={onPressAdd} activeOpacity={0.85}>
        <Text style={styles.fabPlus}>＋</Text>
      </TouchableOpacity>

      {toast && <Toast text={toast.text} onUndo={toast.onUndo} />}

      <ActionSheet
        visible={isSheetOpen && !!openMenuForId}
        onClose={() => { setIsSheetOpen(false); setOpenMenuForId(null); }}
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
              <TouchableOpacity onPress={confirmRename} style={[styles.modalButton, styles.modalButtonConfirm]} disabled={!newName.trim()}>
                <Text style={[styles.modalButtonTextConfirm, !newName.trim() && styles.modalButtonTextDisabled]}>Rename</Text>
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
  container: { flex: 1, backgroundColor: Colors.dark.background, overflow: "visible" },
  tabsRow: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, gap: 8 },

  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 6 },
  title: { fontSize: 24, fontWeight: "700", color: "#F5F0E1" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#A9A9A9" },

  filtersRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, flexWrap: "wrap", columnGap: 8, rowGap: 8 },
  categoriesWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", rowGap: 8, columnGap: 8, flexShrink: 1 },

  listContent: { paddingHorizontal: 10, paddingBottom: 120, paddingTop: 10, overflow: "visible" },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  emptyTitle: { color: "#EDEDED", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: { color: "#A9A9A9", fontSize: 14, textAlign: "center" },

  primaryBtn: { backgroundColor: "#3B7BFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#3B7BFF" },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700" },

  fab: {
    position: "absolute", right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3B7BFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fabPlus: { color: "#FFFFFF", fontSize: 28, marginTop: -2, fontWeight: "600" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContent: { backgroundColor: "#1C1C22", borderRadius: 16, padding: 20, width: "100%", maxWidth: 320, borderWidth: 1, borderColor: "#2C2C34" },
  modalTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  modalInput: { backgroundColor: "#1A1A1E", borderWidth: 1, borderColor: "#232329", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: "#EAEAEA", fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  modalButtonCancel: { backgroundColor: "transparent", borderColor: "#2A2A30" },
  modalButtonConfirm: { backgroundColor: "#3B7BFF", borderColor: "#3B7BFF" },
  modalButtonTextCancel: { color: "#CFCFCF", fontSize: 16, fontWeight: "600" },
  modalButtonTextConfirm: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  modalButtonTextDisabled: { color: "#8B8B8B" },
});
