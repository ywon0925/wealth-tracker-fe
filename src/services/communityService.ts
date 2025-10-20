import { apiClient } from './apiClient';
import { Post, Comment, CreatePostRequest, CreateCommentRequest, VoteRequest } from '../types';

export const communityService = {
  async listFeed(sort?: 'hot' | 'new' | 'top', topic?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    if (sort) params.append('sort', sort);
    if (topic) params.append('topic', topic);

    const queryString = params.toString();
    const url = queryString ? `/community?${queryString}` : '/community';

    return await apiClient.get<Post[]>(url);
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return await apiClient.post<Post>('/community', data);
  },

  async getThread(postId: string): Promise<{ post: Post; comments: Comment[] }> {
    return await apiClient.get<{ post: Post; comments: Comment[] }>(`/community/${postId}`);
  },

  async createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    return await apiClient.post<Comment>(`/community/${postId}/comments`, data);
  },

  async votePost(postId: string, delta: 1 | -1): Promise<void> {
    return await apiClient.post(`/community/${postId}/vote`, { delta });
  },

  async voteComment(commentId: string, delta: 1 | -1): Promise<void> {
    return await apiClient.post(`/community/comments/${commentId}/vote`, { delta });
  },
};
