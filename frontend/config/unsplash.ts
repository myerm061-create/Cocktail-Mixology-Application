// For now put placeholder credentials.ts file to satisfy this typecheck error
import { CREDENTIALS } from './credentials';

// Unsplash API Configuration
export const UNSPLASH_CONFIG = {
  API_KEY: CREDENTIALS.UNSPLASH_API_KEY,
  BASE_URL: 'https://api.unsplash.com',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_IMAGES_PER_HOUR: 50,
} as const;
