// Utility to normalize ingredient names for comparison
const ALIASES: Record<string, string> = {
  "london dry gin": "gin",
  "dry gin": "gin",
  "blanco tequila": "tequila",
  "white rum": "rum",
  "gold rum": "rum",
  cointreau: "triple sec",
  curaçao: "triple sec",
  "angostura bitters": "aromatic bitters",
  bitters: "aromatic bitters",
  "simple syrup": "sugar syrup",
  "fresh lime juice": "lime juice",
  "fresh lemon juice": "lemon juice",
  "club soda": "soda water",
  soda: "soda water",
};

const STRIP = /[\(\)\[\]\{\}:,_\-–—]/g;

export function normalizeIngredient(raw: string): string {
  if (!raw) return "";
  let s = raw.toLowerCase().trim();

  // remove punctuation / collapse space
  s = s.replace(STRIP, " ").replace(/\s+/g, " ");

  // drop filler words + units
  s = s
    .replace(/\b(fresh|house|homemade|of|the|and|a)\b/g, "")
    .replace(/\b(ml|oz|ounce|ounces|tsp|tbsp|dash|dashes)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // cheap plural → singular
  if (s.endsWith("ies")) s = s.slice(0, -3) + "y";
  else if (s.endsWith("s") && s.length > 3) s = s.slice(0, -1);

  // alias exact
  if (ALIASES[s]) return ALIASES[s];

  // fall back to first token (e.g., "gin london dry" → "gin")
  const head = s.split(" ")[0];
  return ALIASES[head] ?? head;
}

export function normalizeSet(list: string[]): Set<string> {
  return new Set(list.map(normalizeIngredient));
}
