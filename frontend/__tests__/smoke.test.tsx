import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CocktailCard from '@/components/ui/CocktailCard';

// Simple smoke test to ensure components render without crashing
it('renders CocktailCard', () => {
  render(<CocktailCard id="1" name="Margarita" />);
  expect(screen.getByLabelText('Open Margarita')).toBeTruthy();
});
