<<<<<<< HEAD
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import CocktailCard from './CocktailCard';
=======
import React from "react";
import { FlatList, StyleSheet, View, RefreshControl } from "react-native";
import CocktailCard from "./CocktailCard";
>>>>>>> parent of ba5a057 (Revert "Revamp home page, similar to prototype design")

export type CocktailItem = {
  id: string | number;
  name: string;
  thumbUrl?: string | null;
  isFavorite?: boolean;
};

type Props = {
  data: CocktailItem[];
  onPressItem?: (id: string | number) => void;
  onToggleFavorite?: (id: string | number, next: boolean) => void;
  columns?: number;
  bottomPad?: number;
<<<<<<< HEAD
=======
  refreshing?: boolean;
  onRefresh?: () => void;
>>>>>>> parent of ba5a057 (Revert "Revamp home page, similar to prototype design")
};

export default function CocktailGrid({
  data,
  onPressItem,
  onToggleFavorite,
  columns = 2,
  bottomPad = 120,
  refreshing = false,
  onRefresh,
}: Props) {
  const GAP = 12;

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => String(it.id)}
      numColumns={columns}
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <CocktailCard
            id={item.id}
            name={item.name}
            thumbUrl={item.thumbUrl}
            isFavorite={item.isFavorite ?? true}
            onPress={onPressItem}
            onToggleFavorite={onToggleFavorite}
          />
        </View>
      )}
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" /> : undefined}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
