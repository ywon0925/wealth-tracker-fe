import { apiClient } from './apiClient';
import { NetWorthData } from '../types';

export const netWorthService = {
  async calculateNetWorth(userId: string): Promise<NetWorthData> {
    return await apiClient.get<NetWorthData>(`/net-worth/${userId}`);
  },

  async getCachedNetWorth(userId: string): Promise<NetWorthData> {
    return await apiClient.get<NetWorthData>(`/net-worth/${userId}/cache`);
  },
};
