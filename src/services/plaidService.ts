import { apiClient } from './apiClient';

interface CreateLinkTokenResponse {
  linkToken: string;  // Backend returns camelCase
  expiration?: string;
}

export const plaidService = {
  /**
   * Create a Plaid Link token for initializing Plaid Link
   * Backend endpoint: POST /api/plaid/create-link-token
   * Note: Backend automatically gets userId from auth token
   */
  async createLinkToken(): Promise<string> {
    try {
      console.log('Calling backend: POST /plaid/create-link-token');
      const response = await apiClient.post<CreateLinkTokenResponse>(
        '/plaid/create-link-token'
      );
      console.log('Backend response received:', JSON.stringify(response, null, 2));
      console.log('Extracted linkToken:', response.linkToken);
      console.log('Token type:', typeof response.linkToken);
      console.log('Token truthy?', !!response.linkToken);
      return response.linkToken;
    } catch (error: any) {
      console.error('Failed to create link token - error caught:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to create link token');
    }
  },
};
