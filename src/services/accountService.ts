import { apiClient } from './apiClient';
import { Account } from '../types';

type AccountType = Account['accountType'];

interface LinkAccountRequest {
  userId: string;
  publicToken: string;
  institutionName: string;
  accountName: string;
  accountType: AccountType;
  currency?: string;
}

export const accountService = {
  /**
   * Link account using Plaid public token
   * Backend endpoint: POST /api/accounts/link
   * Note: Backend expects userId provided in request body
   */
  async linkAccount(data: LinkAccountRequest): Promise<Account> {
    return await apiClient.post<Account>('/accounts/link', data);
  },

  /**
   * List all accounts for a user
   * Backend endpoint: GET /api/accounts/:userId
   */
  async listAccounts(userId: string): Promise<Account[]> {
    const response = await apiClient.get<{ accounts: Account[] }>(`/accounts/${userId}`);
    return Array.isArray(response.accounts) ? response.accounts : [];
  },

  /**
   * Refresh account balances from Plaid
   * Backend endpoint: POST /api/accounts/refresh
   * Note: Backend requires userId in the request body
   */
  async refreshAccounts(userId: string): Promise<Account[]> {
    const response = await apiClient.post<{ accounts: Account[] }>('/accounts/refresh', { userId });
    return Array.isArray(response.accounts) ? response.accounts : [];
  },
};
