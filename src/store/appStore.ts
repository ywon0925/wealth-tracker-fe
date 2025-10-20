import { create } from 'zustand';
import { Account, NetWorthData, RankingData, Post, Subscription } from '../types';

interface AppState {
  accounts: Account[];
  netWorth: NetWorthData | null;
  ranking: RankingData | null;
  subscription: Subscription | null;
  feedPosts: Post[];

  // Actions
  setAccounts: (accounts: Account[]) => void;
  setNetWorth: (netWorth: NetWorthData | null) => void;
  setRanking: (ranking: RankingData) => void;
  setSubscription: (subscription: Subscription) => void;
  setFeedPosts: (posts: Post[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  accounts: [],
  netWorth: null,
  ranking: null,
  subscription: null,
  feedPosts: [],

  setAccounts: (accounts) => set({ accounts }),
  setNetWorth: (netWorth) => set({ netWorth }),
  setRanking: (ranking) => set({ ranking }),
  setSubscription: (subscription) => set({ subscription }),
  setFeedPosts: (feedPosts) => set({ feedPosts }),
}));
