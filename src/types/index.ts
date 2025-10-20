// User & Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  annualIncome?: number;
  country: string;
  state: string;
  city: string;
  alias?: string;
  verified: boolean;
  subscriptionTier: 'free' | 'premium' | 'pro';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  annualIncome?: number;
  country: string;
  state: string;
  city: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Account Types
export interface Account {
  id: string;
  userId: string;
  plaidItemId: string;
  plaidAccountId: string;
  institutionName: string;
  accountName: string;
  accountType: 'cash' | 'investment' | 'credit' | 'loan' | 'crypto' | 'other';
  balance: number;
  currency: string;
  lastSynced: string;
  isActive: boolean;
  createdAt: string;
}

export interface LinkAccountRequest {
  userId: string;
  publicToken: string;
  institutionName: string;
  accountName: string;
  accountType: 'cash' | 'investment' | 'credit' | 'loan' | 'crypto' | 'other';
  currency?: string;
}

// Net Worth Types
export interface NetWorthData {
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    cash: number;
    investments: number;
    crypto: number;
    loans: number;
    credit: number;
  };
  calculatedAt: string;
}

export interface NetWorthHistory {
  date: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

// Ranking Types
export interface RankingData {
  percentile: number;
  ageRange: string;
  location: string;
  incomeBracket?: string;
  peerCount: number;
  userNetWorth: number;
  averageNetWorth: number;
}

export interface RankingRequest {
  ageRange: string;
  location: string;
  incomeBracket?: string;
}

// Community Types
export interface Post {
  id: string;
  userId: string;
  alias: string;
  title: string;
  body: string;
  topic: string;
  verified: boolean;
  votes: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  alias: string;
  body: string;
  verified: boolean;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  topic: string;
}

export interface CreateCommentRequest {
  body: string;
}

export interface VoteRequest {
  delta: 1 | -1;
}

// Subscription Types
export interface Subscription {
  userId: string;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'canceled' | 'expired';
  startedAt: string;
  expiresAt?: string;
  paymentMethod?: string;
}

export interface UpgradeSubscriptionRequest {
  tier: 'premium' | 'pro';
  paymentIntentId: string;
}

// Analytics Types
export interface TrackEventRequest {
  name: string;
  properties?: Record<string, any>;
}
