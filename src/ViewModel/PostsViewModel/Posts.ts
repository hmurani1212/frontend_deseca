import { StateCreator } from 'zustand';
import postsApi from '../../Model/Data/Posts/Posts';

interface Post {
  _id: string;
  user_id: string;
  content: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  scheduled_at: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metadata?: {
    hashtags?: string[];
    word_count?: number;
  };
  created_at?: string;
  updated_at?: string;
}

interface PostFilters {
  status: string;
  platform: string;
  search: string;
  sort: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  loadMore?: boolean;
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

interface PostsState {
  posts: Post[];
  copyAllPosts: Post[];
  currentPost: Post | null;
  postAnalytics: any;
  isLoadingPosts: boolean;
  isLoadingPost: boolean;
  isLoadingAnalytics: boolean;
  pagination: Pagination;
  isLoadingMore: boolean;
  hasMore: boolean;
  filters: PostFilters;
  getPostsList: (params?: PostParams) => Promise<{ success: boolean; data?: any; error?: string }>;
  getPostById: (postId: string) => Promise<{ success: boolean; data?: Post; error?: string }>;
  createPost: (postData: CreatePostData) => Promise<{ success: boolean; data?: Post; error?: string }>;
  updatePost: (postId: string, postData: UpdatePostData) => Promise<{ success: boolean; data?: Post; error?: string }>;
  deletePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  getPostAnalytics: (postId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  setFilters: (filters: Partial<PostFilters>) => void;
  loadMorePosts: () => Promise<{ success: boolean; error?: string }>;
  resetFilters: () => void;
  searchPosts: (searchTerm: string) => void;
}

const postsViewModel: StateCreator<PostsState> = (set, get, api) => ({
  // State
  posts: [],
  copyAllPosts: [],
  currentPost: null,
  postAnalytics: null,
  isLoadingPosts: false,
  isLoadingPost: false,
  isLoadingAnalytics: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoadingMore: false,
  hasMore: false,
  filters: {
    status: '',
    platform: '',
    search: '',
    sort: '-created_at',
  },
  
  // Get all posts
  getPostsList: async (params: PostParams = {}) => {
    const loadMore = params.loadMore || false;
    set({ isLoadingPosts: true });
    
    try {
      const filters = get().filters;
      const pagination = get().pagination;
      const currentPosts = get().posts;
      
      // If loading more, increment page, otherwise reset to page 1
      const nextPage = loadMore ? (pagination.page + 1) : 1;
      
      // Extract loadMore from params (frontend-only flag, don't send to backend)
      const { loadMore: _, ...paramsWithoutLoadMore } = params;
      
      const queryParams: any = {
        page: paramsWithoutLoadMore.page || nextPage,
        limit: paramsWithoutLoadMore.limit || pagination.limit,
        ...filters,
        ...paramsWithoutLoadMore,
      };
      
      // Remove empty filters and frontend-only flags
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || key === 'loadMore') {
          delete queryParams[key];
        }
      });
      
      const response = await postsApi.getAllPosts(queryParams);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        const postsData = data.DB_DATA;
        const newPosts = postsData.posts || [];
        
        // If loading more, append to existing posts, otherwise replace
        const updatedPosts = loadMore ? [...currentPosts, ...newPosts] : newPosts;
        
        const currentPage = postsData.page || nextPage;
        const totalPages = postsData.total_pages || 0;
        
        set({
          posts: updatedPosts,
          copyAllPosts: loadMore ? [...get().copyAllPosts, ...newPosts] : newPosts,
          pagination: {
            page: currentPage,
            limit: postsData.limit || pagination.limit,
            total: postsData.total || 0,
            totalPages: totalPages,
          },
          hasMore: currentPage < totalPages,
          isLoadingPosts: false,
          isLoadingMore: false,
        });
        
        return { success: true, data: postsData };
      } else {
        set({ isLoadingPosts: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch posts' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching posts:', err);
      set({ isLoadingPosts: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch posts' 
      };
    }
  },
  
  // Get post by ID
  getPostById: async (postId: string) => {
    set({ isLoadingPost: true });
    
    try {
      const response = await postsApi.getPostById(postId);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          currentPost: data.DB_DATA,
          isLoadingPost: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingPost: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Post not found' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching post:', err);
      set({ isLoadingPost: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch post' 
      };
    }
  },
  
  // Create post
  createPost: async (postData: CreatePostData) => {
    set({ isLoadingPosts: true });
    
    try {
      const response = await postsApi.createPost(postData);
      const data = response.data;
      
      if (response.status === 201 && data.STATUS === 'SUCCESSFUL') {
        // Refresh posts list
        await get().getPostsList();
        
        set({ isLoadingPosts: false });
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingPosts: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to create post' 
        };
      }
    } catch (err: any) {
      // console.error('Error creating post:', err);
      set({ isLoadingPosts: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to create post' 
      };
    }
  },
  
  // Update post
  updatePost: async (postId: string, postData: UpdatePostData) => {
    set({ isLoadingPosts: true });
    
    try {
      const response = await postsApi.updatePost(postId, postData);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        // Update local state
        const updatedPosts = get().posts.map(post => 
          post._id === postId ? { ...post, ...data.DB_DATA } : post
        );
        
        set({
          posts: updatedPosts,
          copyAllPosts: updatedPosts,
          currentPost: data.DB_DATA,
          isLoadingPosts: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingPosts: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to update post' 
        };
      }
    } catch (err: any) {
      // console.error('Error updating post:', err);
      set({ isLoadingPosts: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to update post' 
      };
    }
  },
  
  // Delete post
  deletePost: async (postId: string) => {
    set({ isLoadingPosts: true });
    
    try {
      const response = await postsApi.deletePost(postId);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        // Remove from local state
        const filteredPosts = get().posts.filter(post => post._id !== postId);
        
        set({
          posts: filteredPosts,
          copyAllPosts: filteredPosts,
          isLoadingPosts: false,
        });
        
        return { success: true };
      } else {
        set({ isLoadingPosts: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to delete post' 
        };
      }
    } catch (err: any) {
      // console.error('Error deleting post:', err);
      set({ isLoadingPosts: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to delete post' 
      };
    }
  },
  
  // Get post analytics
  getPostAnalytics: async (postId: string) => {
    set({ isLoadingAnalytics: true });
    
    try {
      const response = await postsApi.getPostAnalytics(postId);
      const data = response.data;
      
      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        set({
          postAnalytics: data.DB_DATA,
          isLoadingAnalytics: false,
        });
        
        return { success: true, data: data.DB_DATA };
      } else {
        set({ isLoadingAnalytics: false });
        return { 
          success: false, 
          error: data.ERROR_DESCRIPTION || 'Failed to fetch analytics' 
        };
      }
    } catch (err: any) {
      // console.error('Error fetching post analytics:', err);
      set({ isLoadingAnalytics: false });
      return { 
        success: false, 
        error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Failed to fetch analytics' 
      };
    }
  },
  
  // Set filters
  setFilters: (filters: Partial<PostFilters>) => {
    set({ 
      filters: { ...get().filters, ...filters },
      // Reset pagination when filters change
      pagination: {
        ...get().pagination,
        page: 1,
      },
      hasMore: false,
    });
  },
  
  // Load more posts
  loadMorePosts: async () => {
    const { isLoadingMore, hasMore } = get();
    
    if (isLoadingMore || !hasMore) {
      return { success: false, error: 'Cannot load more posts' };
    }
    
    set({ isLoadingMore: true });
    
    try {
      const result = await get().getPostsList({ loadMore: true });
      return result;
    } catch (err: any) {
      set({ isLoadingMore: false });
      return { 
        success: false, 
        error: err.message || 'Failed to load more posts' 
      };
    }
  },
  
  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        status: '',
        platform: '',
        search: '',
        sort: '-created_at',
      },
    });
  },
  
  // Search posts (local)
  searchPosts: (searchTerm: string) => {
    if (searchTerm.trim() === '') {
      set({ posts: get().copyAllPosts });
    } else {
      const lowercaseTerm = searchTerm.toLowerCase();
      const filtered = get().copyAllPosts.filter(post =>
        post.content.toLowerCase().includes(lowercaseTerm)
      );
      set({ posts: filtered });
    }
  },
});

export default postsViewModel;

