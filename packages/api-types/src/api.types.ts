/**
 * API response and request types
 */

import type { Card, CardSet } from './card.types';
import type { Collection, CollectionCard, Wishlist } from './collection.types';
import type { User } from './user.types';

// Common API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Card API types
export interface CardSearchParams {
  q?: string; // General search query
  name?: string;
  set?: string;
  rarity?: string;
  type?: string;
  hp?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'set' | 'rarity' | 'releaseDate' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface CardSearchResponse {
  cards: Card[];
  totalCount: number;
  pagination: PaginationInfo;
}

export interface SetSearchParams {
  q?: string;
  series?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export interface SetSearchResponse {
  sets: CardSet[];
  totalCount: number;
  pagination: PaginationInfo;
}

// Collection API types
export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddCardToCollectionRequest {
  cardId: string;
  quantity?: number;
  condition?: string;
  foil?: boolean;
  notes?: string;
  acquiredPrice?: number;
}

export interface UpdateCollectionCardRequest {
  quantity?: number;
  condition?: string;
  foil?: boolean;
  notes?: string;
  acquiredPrice?: number;
}

// User API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Record<string, any>; // Use generic object to avoid conflict
}

// Vision/Recognition API types
export interface CardRecognitionRequest {
  image: string; // Base64 encoded image
  options?: {
    targetName?: string;
    confidenceThreshold?: number;
  };
}

export interface CardRecognitionResponse {
  detectedCard?: Card;
  confidence: number;
  alternativeCandidates?: Array<{
    card: Card;
    confidence: number;
  }>;
  recognitionDetails: {
    pokemonName?: string;
    hp?: string;
    attacks?: string[];
    setNumber?: string;
    processingTime: number;
  };
}
