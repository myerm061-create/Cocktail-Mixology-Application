// src/data/mockProfiles.ts
export type Recipe = { id: string; name: string; likes: number };
export type Friend = { id: string; name: string; avatarUrl?: string };
export type Profile = {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  favorites: string[];
  sharedRecipes: Recipe[];
  friends: Friend[];
};

// current user for demo
export const ME_ID = "bob";

export const profiles: Record<string, Profile> = {
  alice: {
    id: "alice",
    name: "Alice",
    bio: "Citrus-forward home bartender. Zero-proof experiments + homemade syrups.",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    favorites: ["Yuzu Highball", "Matcha Gin Fizz", "Paloma", "Paper Plane"],
    sharedRecipes: [
      { id: "a1", name: "Lychee Saketini", likes: 58 },
      { id: "a2", name: "Grapefruit Paloma", likes: 73 },
    ],
    friends: [], // empty so Add Friend appears when Bob views Alice
  },
  bob: {
    id: "bob",
    name: "Bob",
    bio: "Home mixologist. Loves citrus + whiskey.",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    favorites: ["Old Fashioned", "Negroni", "Amaretto Sour"],
    sharedRecipes: [{ id: "b1", name: "Charred Lemon Sour", likes: 22 }],
    friends: [{ id: "alice", name: "Alice", avatarUrl: "https://i.pravatar.cc/150?img=32" }],
  },
};

export function getProfile(id?: string): Profile {
  const key = (id ?? ME_ID).toLowerCase();
  return profiles[key] ?? profiles[ME_ID];
}
