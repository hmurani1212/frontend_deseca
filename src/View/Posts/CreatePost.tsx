import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../../Components/Toaster/Toaster';
import { FiArrowLeft } from 'react-icons/fi';

interface FormData {
  content: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

interface FormErrors {
  content?: string;
  platform?: string;
  scheduled_at?: string;
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const createPost = useStore((state: RootState) => state.createPost);
  const isLoadingPosts = useStore((state: RootState) => state.isLoadingPosts);
  
  const [formData, setFormData] = useState<FormData>({
    content: '',
    platform: 'twitter',
    scheduled_at: '',
    status: 'draft',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Content must be 1000 characters or less';
    }
    
    if (!formData.platform) {
      newErrors.platform = 'Platform is required';
    }
    
    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Scheduled date is required';
    } else {
      const scheduledDate = new Date(formData.scheduled_at);
      if (scheduledDate < new Date()) {
        newErrors.scheduled_at = 'Scheduled date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const result = await createPost({
      ...formData,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
    });
    
    if (result.success) {
      showToast('Post created successfully!', 'success');
      navigate('/posts');
    } else {
      showToast(result.error || 'Failed to create post', 'error');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/posts')}
          className="text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-gray-600">Create a new social media post</p>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              value={formData.content}
              onChange={handleChange}
              maxLength={1000}
              className={`w-full px-3 py-2 border ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="Write your post content here..."
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.content.length}/1000 characters
              </p>
            </div>
          </div>
          
          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.platform ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            {errors.platform && (
              <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
            )}
          </div>
          
          {/* Scheduled Date */}
          <div>
            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.scheduled_at ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.scheduled_at && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_at}</p>
            )}
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select "Draft" to save for later, "Scheduled" to automatically publish at the scheduled time, "Published" to mark as published, or "Failed" if publishing failed
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingPosts}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingPosts ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;

