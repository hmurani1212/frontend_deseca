import axiosInstance from '../../base';
import { API_ENDPOINTS } from '../../BaseUri';
import { AxiosPromise } from 'axios';

interface PostParams {
  page?: number;
  limit?: number;
  cursor?: string;
  status?: string;
  platform?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: string;
  pagination_type?: 'offset' | 'cursor';
}

interface CreatePostData {
  content: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  scheduled_at: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
  published_at?: string;
}

interface UpdatePostData {
  content?: string;
  platform?: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  scheduled_at?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'failed';
}

const postsApi = {
  // Get all posts with filters, pagination, search, and sort
  getAllPosts: function (params: PostParams = {}): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.POSTS.BASE,
      params: params
    });
  },
  
  // Get post by ID
  getPostById: function (postId: string): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.POSTS.BY_ID(postId)
    });
  },
  
  // Create new post
  createPost: function (data: CreatePostData): AxiosPromise {
    return axiosInstance.request({
      method: 'POST',
      url: API_ENDPOINTS.POSTS.BASE,
      data: data
    });
  },
  
  // Update post
  updatePost: function (postId: string, data: UpdatePostData): AxiosPromise {
    return axiosInstance.request({
      method: 'PUT',
      url: API_ENDPOINTS.POSTS.BY_ID(postId),
      data: data
    });
  },
  
  // Delete post
  deletePost: function (postId: string): AxiosPromise {
    return axiosInstance.request({
      method: 'DELETE',
      url: API_ENDPOINTS.POSTS.BY_ID(postId)
    });
  },
  
  // Get post analytics
  getPostAnalytics: function (postId: string): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.POSTS.ANALYTICS(postId)
    });
  }
};

export default postsApi;

