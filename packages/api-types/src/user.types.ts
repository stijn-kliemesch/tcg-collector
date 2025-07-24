/**
 * User and authentication types
 */

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  defaultCollection?: string;
  priceAlerts: boolean;
  emailNotifications: boolean;
  publicProfile: boolean;
  defaultCardCondition: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isPublic: boolean;
  stats: UserStats;
  badges: UserBadge[];
  joinedAt: string;
}

export interface UserStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  completedSets: number;
  collectionsCount: number;
  achievementPoints: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserPermissions {
  canModerateContent: boolean;
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}
