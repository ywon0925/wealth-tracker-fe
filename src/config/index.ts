// App Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';
export const PLAID_LINK_TOKEN_URL = process.env.PLAID_LINK_TOKEN_URL || 'http://localhost:4000/api/plaid/create-link-token';

export const APP_CONFIG = {
  apiTimeout: 30000,
  maxAccountsFreeTier: 3,
  subscriptionTiers: {
    free: {
      name: 'Free',
      price: 0,
      maxAccounts: 3,
      refreshFrequency: 'weekly',
    },
    premium: {
      name: 'Premium',
      price: 15,
      maxAccounts: -1, // unlimited
      refreshFrequency: 'daily',
    },
    pro: {
      name: 'Pro',
      price: 40,
      maxAccounts: -1,
      refreshFrequency: 'on-demand',
    },
  },
};
