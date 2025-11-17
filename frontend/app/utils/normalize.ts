// Utility to normalize ingredient names for matching and display
const STRIP = /[\(\)\[\]\{\}:,_\-–—]/g;

// Map common variants -> CocktailDB *canonical* ingredient names (exact casing)
const ALIASES_TO_COCKTAILDB: Record<string, string> = {
  gin: 'Gin',
  'dry gin': 'Gin',
  'london dry gin': 'Gin',

  tequila: 'Tequila',
  'blanco tequila': 'Tequila',
  'silver tequila': 'Tequila',

  'white rum': 'White Rum',
  'light rum': 'White Rum',
  rum: 'Rum',
  'gold rum': 'Rum',
  'dark rum': 'Dark Rum',

  'triple sec': 'Triple Sec',
  cointreau: 'Triple Sec',
  curaçao: 'Triple Sec',
  'orange curaçao': 'Triple Sec',

  'sweet vermouth': 'Sweet Vermouth',
  'rosso vermouth': 'Sweet Vermouth',
  'dry vermouth': 'Dry Vermouth',

  'angostura bitters': 'Angostura bitters',
  bitters: 'Bitters',

  'simple syrup': 'Sugar Syrup',
  'sugar syrup': 'Sugar Syrup',

  'club soda': 'Soda Water',
  soda: 'Soda Water',

  'fresh lime juice': 'Lime Juice',
  'lime juice': 'Lime Juice',
  'fresh lemon juice': 'Lemon Juice',
  'lemon juice': 'Lemon Juice',
};

export type NormalizedIngredient = {
  displayName: string; // what we show in UI
  canonicalName: string; // what we use for CocktailDB image URL / exact lookup
};

// Title Case helper for a nicer display when we don't have an alias
function titleCase(s: string) {
  return s.replace(
    /\w\S*/g,
    (w) => w[0].toUpperCase() + w.slice(1).toLowerCase(),
  );
}

// Full, non-truncating normalizer
export function normalizeIngredient(raw: string): NormalizedIngredient {
  if (!raw) return { displayName: '', canonicalName: '' };

  // keep words; drop noisy punctuation; collapse spaces
  const collapsed = raw.replace(STRIP, ' ').replace(/\s+/g, ' ').trim();

  const lower = collapsed.toLowerCase();

  // Remove filler/unit words only for the *key* we look up, but keep full phrase
  const key = lower
    .replace(/\b(fresh|house|homemade|of|the|and|a)\b/g, '')
    .replace(/\b(ml|oz|ounce|ounces|tsp|tbsp|dash|dashes)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Map to a known CocktailDB name when possible; else keep the full phrase
  const canonicalName =
    ALIASES_TO_COCKTAILDB[key] ??
    ALIASES_TO_COCKTAILDB[lower] ??
    // if we don't know it, keep the original (but prettified)
    titleCase(collapsed);

  // Prefer the canonical (properly cased) as display if the user typed “light rum”, “vodka”, etc.
  const displayName = canonicalName || titleCase(collapsed);

  return { displayName, canonicalName };
}

/**
 * Lightweight key used for fuzzy matching/sets (keeps old behavior).
 * NOTE: This intentionally simplifies down to a single comparable token/phrase.
 */
export function normalizeKey(raw: string): string {
  if (!raw) return '';
  let s = raw.toLowerCase().trim();
  s = s.replace(STRIP, ' ').replace(/\s+/g, ' ');
  s = s
    .replace(/\b(fresh|house|homemade|of|the|and|a)\b/g, '')
    .replace(/\b(ml|oz|ounce|ounces|tsp|tbsp|dash|dashes)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // very light singularization
  if (s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.endsWith('s') && s.length > 3) s = s.slice(0, -1);

  // prefer alias if available; otherwise return the simplified phrase (no first-word truncation)
  return ALIASES_TO_COCKTAILDB[s]?.toLowerCase() ?? s;
}

export function normalizeSet(list: string[]): Set<string> {
  return new Set(list.map(normalizeKey));
}
