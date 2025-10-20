import { apiClient } from './apiClient';
import { Subscription, UpgradeSubscriptionRequest } from '../types';

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription> {
    return await apiClient.get<Subscription>(`/subscription/${userId}`);
  },

  async upgradeSubscription(userId: string, data: UpgradeSubscriptionRequest): Promise<Subscription> {
    return await apiClient.post<Subscription>('/subscription/upgrade', {
      userId,
      ...data,
    });
  },

  async downgradeSubscription(userId: string): Promise<Subscription> {
    return await apiClient.post<Subscription>('/subscription/downgrade', { userId });
  },
};
