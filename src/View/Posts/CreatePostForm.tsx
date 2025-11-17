import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Button, Input, Textarea, Select, Option } from '@material-tailwind/react';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../../Components/Toaster/Toaster';

interface CreatePostFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  postId?: string | null;
  initialData?: any;
}

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

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess, onCancel, postId = null, initialData = null }) => {
  const createPost = useStore((state: RootState) => state.createPost);
  const updatePost = useStore((state: RootState) => state.updatePost);
  const getPostById = useStore((state: RootState) => state.getPostById);
  const isLoadingPosts = useStore((state: RootState) => state.isLoadingPosts);
  const isLoadingPost = useStore((state: RootState) => state.isLoadingPost);
  const currentPost = useStore((state: RootState) => state.currentPost);
  
  const isEditMode = !!postId;
  
  const [formData, setFormData] = useState<FormData>({
    content: '',
    platform: 'twitter',
    scheduled_at: '',
    status: 'draft',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Load post data when editing
  useEffect(() => {
    if (isEditMode && postId) {
      getPostById(postId);
    }
  }, [isEditMode, postId, getPostById]);
  
  // Populate form when post data is loaded
  useEffect(() => {
    if (isEditMode && currentPost) {
      const scheduledDate = new Date(currentPost.scheduled_at);
      const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        content: currentPost.content || '',
        platform: currentPost.platform || 'twitter',
        scheduled_at: localDateTime,
        status: currentPost.status || 'draft',
      });
    } else if (initialData) {
      // Use initialData if provided
      const scheduledDate = new Date(initialData.scheduled_at);
      const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        content: initialData.content || '',
        platform: initialData.platform || 'twitter',
        scheduled_at: localDateTime,
        status: initialData.status || 'draft',
      });
    }
  }, [isEditMode, currentPost, initialData]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects
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
    } else if (!isEditMode) {
      // Only validate future date for new posts
      const scheduledDate = new Date(formData.scheduled_at);
      const now = new Date();
      if (scheduledDate < now) {
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
    
    const postData = {
      ...formData,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
    };
    
    let result;
    if (isEditMode && postId) {
      result = await updatePost(postId, postData);
      if (result.success) {
        showToast('Post updated successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to update post', 'error');
      }
    } else {
      result = await createPost(postData);
      if (result.success) {
        showToast('Post created successfully!', 'success');
        // Reset form
        setFormData({
          content: '',
          platform: 'twitter',
          scheduled_at: '',
          status: 'draft',
        });
        setErrors({});
      } else {
        showToast(result.error || 'Failed to create post', 'error');
      }
    }
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  // Platform options
  const platformOptions = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
  ];

  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'failed', label: 'Failed' },
  ];
  
  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Content */}
        <div className='w-full'>
          <Textarea
            color="blue"
            label="Post Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here..."
            rows={6}
            error={!!errors.content}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
          <div className="flex justify-end mt-1">
            <p className="text-sm text-gray-500">
              {formData.content.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Platform Selection */}
        <div className='w-full'>
          <Select 
            label="Platform" 
            color="blue"
            className='!h-11 !rounded-6'
            value={formData.platform}
            onChange={(value) => handleSelectChange('platform', value as string)}
            error={!!errors.platform}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {platformOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          {errors.platform && (
            <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
          )}
        </div>

        {/* Scheduled Date & Time */}
        <div className='w-full'>
          <Input
            label="Scheduled Date & Time"
            color='blue'
            className='!h-11 !rounded-6'
            type="datetime-local"
            name="scheduled_at"
            value={formData.scheduled_at}
            onChange={handleChange}
            error={!!errors.scheduled_at}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          />
          {errors.scheduled_at && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduled_at}</p>
          )}
          <small className="text-gray-500 text-xs mt-1 block">
            Select the date and time when this post should be published
          </small>
        </div>

        {/* Status Selection */}
        <div className='w-full'>
          <Select 
            label="Status" 
            color="blue"
            className='!h-11 !rounded-6'
            value={formData.status}
            onChange={(value) => handleSelectChange('status', value as string)}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <small className="text-gray-500 text-xs mt-1 block">
            Select "Draft" to save for later, "Scheduled" to automatically publish at the scheduled time, "Published" to mark as published, or "Failed" if publishing failed
          </small>
        </div>

        {/* Submit Button */}
        <div className='w-full flex justify-end gap-4 pt-4 border-t border-gray-200'>
          <Button 
            color="gray" 
            variant="outlined"
            type="button"
            onClick={onCancel}
            className="px-8 py-2"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            Cancel
          </Button>
          <Button 
            color="blue" 
            type="submit"
            disabled={isLoadingPosts || isLoadingPost}
            className="px-8 py-2"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
          >
            {isLoadingPosts || isLoadingPost 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update Post' : 'Create Post')}
          </Button>
        </div>
      </form>
  );
};

export default CreatePostForm;

