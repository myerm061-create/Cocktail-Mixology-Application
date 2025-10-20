export const abvToGrams = (ml: number, abvPct: number) => {
  const ethanolMl = ml * (abvPct / 100);
  const ethanolGrams = ethanolMl * 0.789; // grams per ml of ethanol
  return Math.round(ethanolGrams * 100) / 100;
};
