import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input, Select, Option, Button } from '@material-tailwind/react';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../../Components/Toaster/Toaster';
import { FiPlus, FiEdit2, FiTrash2, FiBarChart2, FiSearch } from 'react-icons/fi';
import CustomDrawer from '../../Components/CustomDrawer/CustomDrawer';
import CreatePostForm from './CreatePostForm';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import { useDebounce } from '../../services/__debounceServices';

interface Post {
  _id: string;
  content: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string;
  created_at?: string;
  updated_at?: string;
}

const Posts: React.FC = () => {
  const posts = useStore((state: RootState) => state.posts);
  const isLoadingPosts = useStore((state: RootState) => state.isLoadingPosts);
  const isLoadingMore = useStore((state: RootState) => state.isLoadingMore);
  const hasMore = useStore((state: RootState) => state.hasMore);
  const pagination = useStore((state: RootState) => state.pagination);
  const filters = useStore((state: RootState) => state.filters);
  const getPostsList = useStore((state: RootState) => state.getPostsList);
  const deletePost = useStore((state: RootState) => state.deletePost);
  const setFilters = useStore((state: RootState) => state.setFilters);
  const resetFilters = useStore((state: RootState) => state.resetFilters);
  const loadMorePosts = useStore((state: RootState) => state.loadMorePosts);
  
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>(filters.search || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const getPostById = useStore((state: RootState) => state.getPostById);
  const currentPost = useStore((state: RootState) => state.currentPost);
  
  // CRITICAL: Prevent duplicate API calls in React StrictMode
  const isMountedRef = useRef<boolean>(false);
  const postsRequestInProgress = useRef<boolean>(false);
  
  // Initial load
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    // This will only run once per component mount
    if (isMountedRef.current) {
      return;
    }
    
    // Prevent concurrent duplicate calls
    if (postsRequestInProgress.current) {
      return;
    }
    
    isMountedRef.current = true;
    postsRequestInProgress.current = true;
    
    // Call getPostsList and reset flag when done
    const loadPosts = async (): Promise<void> => {
      try {
        await getPostsList();
      } finally {
        postsRequestInProgress.current = false;
      }
    };
    
    loadPosts();
  }, [getPostsList]);
  
  // Debounced search function
  const debouncedSearch = useDebounce(async (searchTerm: string): Promise<void> => {
    setFilters({ search: searchTerm });
    await getPostsList({ page: 1, search: searchTerm });
  }, 300); // 300ms debounce delay
  
  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };
  
  // Handle filter changes (Status, Platform, Sort) - apply immediately
  const handleFilterChange = async (key: string, value: string | undefined): Promise<void> => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    await getPostsList({ page: 1, ...newFilters });
  };
  
  // Handle reset filters
  const handleResetFilters = async (): Promise<void> => {
    resetFilters();
    setSearchValue('');
    await getPostsList({ page: 1 });
  };
  
  // Handle load more
  const handleLoadMore = async (): Promise<void> => {
    if (isLoadingMore || !hasMore) return;
    
    const result = await loadMorePosts();
    if (!result.success) {
      showToast(result.error || 'Failed to load more posts', 'error');
    }
  };
  
  // Handle edit - open drawer with post data
  const handleEdit = (postId: string): void => {
    setEditingPostId(postId);
    setShowCreateDrawer(true);
  };
  
  // Handle delete - open confirmation dialog
  const handleDelete = (postId: string): void => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const handleConfirmDelete = async (): Promise<void> => {
    if (!postToDelete) return;
    
    const result = await deletePost(postToDelete);
      if (result.success) {
        showToast('Post deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      } else {
        showToast(result.error || 'Failed to delete post', 'error');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = (): void => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };
  
  // Close drawer and reset edit state
  const handleCloseDrawer = (): void => {
    setShowCreateDrawer(false);
    setEditingPostId(null);
  };
  
  const getStatusBadge = (status: string): JSX.Element => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  const getPlatformBadge = (platform: string): JSX.Element => {
    const platformColors: Record<string, string> = {
      twitter: 'bg-blue-100 text-blue-800',
      facebook: 'bg-indigo-100 text-indigo-800',
      instagram: 'bg-pink-100 text-pink-800',
      linkedin: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${platformColors[platform] || 'bg-gray-100 text-gray-800'}`}>
        {platform}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="mt-2 text-gray-600">Manage your social media posts</p>
        </div>
        <button
          onClick={() => setShowCreateDrawer(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" size={20} />
          Add Post
        </button>
      </div>
      
      {/* Filters - Always Visible */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {(filters.status || filters.platform || filters.search || filters.sort !== '-created_at') && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
            <div>
            <Input
              label="Search"
                placeholder="Search content..."
              value={searchValue}
              onChange={handleSearchChange}
              color="blue"
              className="!h-11 !rounded-6"
              icon={<FiSearch className="h-4 w-4" />}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
              />
            </div>
            
          {/* Status */}
            <div>
            <Select
              label="Status"
              color="blue"
              className="!h-11 !rounded-6"
              value={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value as string)}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
              >
              <Option value="">All Status</Option>
              <Option value="draft">Draft</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="published">Published</Option>
              <Option value="failed">Failed</Option>
            </Select>
            </div>
            
          {/* Platform */}
            <div>
            <Select
              label="Platform"
              color="blue"
              className="!h-11 !rounded-6"
              value={filters.platform || ''}
              onChange={(value) => handleFilterChange('platform', value as string)}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
              >
              <Option value="">All Platforms</Option>
              <Option value="twitter">Twitter</Option>
              <Option value="facebook">Facebook</Option>
              <Option value="instagram">Instagram</Option>
              <Option value="linkedin">LinkedIn</Option>
            </Select>
            </div>
            
          {/* Sort By */}
            <div>
            <Select
              label="Sort By"
              color="blue"
              className="!h-11 !rounded-6"
              value={filters.sort || '-created_at'}
              onChange={(value) => handleFilterChange('sort', value as string)}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
              >
              <Option value="-created_at">Newest First</Option>
              <Option value="created_at">Oldest First</Option>
              <Option value="-scheduled_at">Scheduled Date (Desc)</Option>
              <Option value="scheduled_at">Scheduled Date (Asc)</Option>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Posts List */}
      {isLoadingPosts && posts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No posts found</p>
          <button
            onClick={() => setShowCreateDrawer(true)}
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post: Post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {post.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlatformBadge(post.platform)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(post.scheduled_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {post.status === 'published' && (
                            <Link
                              to={`/posts/${post._id}/analytics`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Analytics"
                            >
                              <FiBarChart2 size={18} />
                            </Link>
                          )}
                          {post.status !== 'published' && (
                            <>
                              <button
                                onClick={() => handleEdit(post._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(post._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex items-center justify-center py-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                color="blue"
                variant="outlined"
                className="px-8 py-2"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {isLoadingMore ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Post Drawer */}
      <CustomDrawer
        open={showCreateDrawer}
        closeDrawer={handleCloseDrawer}
        title={editingPostId ? "Edit Post" : "Create New Post"}
        direction="right"
        widthSize="45vw"
        compo={
          <CreatePostForm
            postId={editingPostId}
            onSuccess={() => {
              handleCloseDrawer();
              getPostsList(); // Refresh posts list
            }}
            onCancel={handleCloseDrawer}
          />
        }
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        openDialog={deleteDialogOpen}
        handleOpen={handleCloseDeleteDialog}
        handleConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
        loading={isLoadingPosts}
      />
    </div>
  );
};

export default Posts;

