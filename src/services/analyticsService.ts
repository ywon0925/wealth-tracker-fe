import { apiClient } from './apiClient';
import { TrackEventRequest } from '../types';

export const analyticsService = {
  async trackEvent(userId: string, event: TrackEventRequest): Promise<void> {
    await apiClient.post('/analytics/track', {
      userId,
      name: event.name,
      properties: event.properties,
    });
  },
};
