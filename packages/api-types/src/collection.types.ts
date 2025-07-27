/**
 * Collection-related type definitions
 */

import type { Card } from './card.types';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  cards: CollectionCard[];
  createdAt: string;
  updatedAt: string;
  stats: CollectionStats;
}

export interface CollectionCard {
  cardId: string;
  card?: Card; // Populated card data
  quantity: number;
  condition: CardCondition;
  foil: boolean;
  notes?: string;
  acquiredDate?: string;
  acquiredPrice?: number;
  currentValue?: number;
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  setCompletion: SetCompletionStats[];
  rarityBreakdown: RarityStats[];
}

export interface SetCompletionStats {
  setId: string;
  setName: string;
  owned: number;
  total: number;
  percentage: number;
}

export interface RarityStats {
  rarity: string;
  count: number;
  percentage: number;
}

export type CardCondition =
  | 'Mint'
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged';

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  cards: WishlistCard[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistCard {
  cardId: string;
  card?: Card;
  priority: WishlistPriority;
  maxPrice?: number;
  notes?: string;
  addedDate: string;
}

export type WishlistPriority = 'Low' | 'Medium' | 'High';
