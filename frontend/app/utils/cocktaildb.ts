export type IngredientImageSize = 'Small' | 'Medium' | 'Large';

// Generate a CocktailDB ingredient image URL for a given ingredient name and size.
export function ingredientImageUrl(
  name: string,
  size: IngredientImageSize = 'Small',
): string {
  const safe = encodeURIComponent(name.trim());
  if (size === 'Large')
    return `https://www.thecocktaildb.com/images/ingredients/${safe}.png`;
  return `https://www.thecocktaildb.com/images/ingredients/${safe}-${size}.png`;
}

// Generate a list of fallback image URLs for an ingredient name, from most specific to least.
export function fallbackIngredientImageUrls(name: string): string[] {
  const candidates = [name];
  // simple fallbacks (you can expand this)
  if (/london dry gin/i.test(name)) candidates.push('Gin');
  if (/blanco tequila/i.test(name)) candidates.push('Tequila');
  if (/white rum/i.test(name)) candidates.push('Rum');
  if (/cointreau/i.test(name)) candidates.push('Triple Sec');
  if (/angostura/i.test(name)) candidates.push('Aromatic Bitters');
  // return small→medium→large options per candidate
  const urls: string[] = [];
  for (const c of candidates) {
    urls.push(ingredientImageUrl(c, 'Small'));
    urls.push(ingredientImageUrl(c, 'Medium'));
    urls.push(ingredientImageUrl(c, 'Large'));
  }
  return urls;
}
