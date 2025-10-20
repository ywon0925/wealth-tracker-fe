import { apiClient } from './apiClient';
import { RankingData, RankingRequest } from '../types';

export const rankingService = {
  async assessRanking(userId: string, filters: RankingRequest): Promise<RankingData> {
    return await apiClient.post<RankingData>('/ranking/assess', {
      userId,
      ...filters,
    });
  },

  async upsertRankingProfile(
    userId: string,
    data: RankingRequest & { netWorth: number }
  ): Promise<void> {
    return await apiClient.post('/ranking/profile', {
      userId,
      ...data,
    });
  },
};
