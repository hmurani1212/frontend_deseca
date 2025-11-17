import React, { useState, useEffect, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../../Components/Toaster/Toaster';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useStore((state: RootState) => state.login);
  const isAuthenticated = useStore((state: RootState) => state.isAuthenticated);
  
  // CRITICAL: Use local loading state instead of global to prevent App.tsx from showing loading screen
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // CRITICAL: Load form data from sessionStorage to persist across re-renders
  const loadFormDataFromStorage = (): FormData => {
    try {
      const saved = sessionStorage.getItem('loginFormData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore errors
    }
    return { email: '', password: '' };
  };
  
  const [formData, setFormData] = useState<FormData>(loadFormDataFromStorage);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');
  
  // CRITICAL: Save form data to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('loginFormData', JSON.stringify(formData));
    } catch (e) {
      // Ignore errors
    }
  }, [formData]);
  
  // CRITICAL: Clear saved form data only on successful login
  useEffect(() => {
    if (isAuthenticated) {
      try {
        sessionStorage.removeItem('loginFormData');
      } catch (e) {
        // Ignore errors
      }
    }
  }, [isAuthenticated]);
  
  // Redirect to dashboard if already authenticated
  // CRITICAL: Don't reset form data in useEffect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // CRITICAL: Prevent any accidental form resets
  // This ensures form data persists even if component re-renders
  useEffect(() => {
    // Only initialize form data if it's completely empty (first mount)
    // Don't reset on subsequent renders
    if (!formData.email && !formData.password) {
      // This is the initial mount, form is already initialized with empty values
      // Do nothing - formData is already set correctly
    }
  }, []); // Empty dependency array - only run on mount
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
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
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): Promise<boolean> => {
    // CRITICAL: Prevent default form submission and page reload - MULTIPLE SAFEGUARDS
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if ('stopImmediatePropagation' in e) {
        (e as any).stopImmediatePropagation();
      }
      if ('nativeEvent' in e && e.nativeEvent && 'stopImmediatePropagation' in e.nativeEvent) {
        (e.nativeEvent as any).stopImmediatePropagation();
      }
    }
    
    // CRITICAL: Store form data before any async operations to prevent loss
    const currentFormData = { ...formData };
    
    // Clear previous API errors (but NOT form data)
    setApiError('');
    
    if (!validate()) {
      return false; // Explicitly return false
    }
    
    // Set local loading state (doesn't trigger App.tsx loading screen)
    setIsSubmitting(true);
    
    try {
      const result = await login(currentFormData);
      
      if (result && result.success) {
        setIsSubmitting(false);
        showToast('Login successful!', 'success');
        // Only navigate on success - NEVER on error
        navigate('/dashboard');
        return false;
      } else {
        setIsSubmitting(false);
        // Set API error message but PRESERVE form data
        const errorMessage = result?.error || 'Invalid email or password';
        setApiError(errorMessage);
        showToast(errorMessage, 'error');
        
        // CRITICAL: Ensure form data is preserved - restore if somehow lost
        setFormData(prev => {
          // Only update if data was somehow cleared
          if (!prev.email && !prev.password && currentFormData.email && currentFormData.password) {
            return currentFormData;
          }
          return prev; // Keep existing data
        });
        
        // CRITICAL: NO navigation, NO reload, NO redirect on error
        return false; // Explicitly return false to prevent any default behavior
      }
    } catch (error: any) {
      setIsSubmitting(false);
      // Handle ALL error types including 429 (rate limit), 401, 500, etc.
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 429) {
          errorMessage = data?.ERROR_DESCRIPTION || 'Too many authentication attempts. Please try again later.';
        } else if (status === 401) {
          errorMessage = data?.ERROR_DESCRIPTION || 'Invalid email or password';
        } else {
          errorMessage = data?.ERROR_DESCRIPTION || error?.message || 'Login failed. Please try again.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      showToast(errorMessage, 'error');
      
      // CRITICAL: Ensure form data is preserved - restore if somehow lost
      setFormData(prev => {
        // Only update if data was somehow cleared
        if (!prev.email && !prev.password && currentFormData.email && currentFormData.password) {
          return currentFormData;
        }
        return prev; // Keep existing data
      });
      
      // CRITICAL: NO navigation, NO reload, NO redirect on error
      return false; // Explicitly return false to prevent any default behavior
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Social Media Analytics Platform
          </p>
        </div>
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            if ('stopImmediatePropagation' in e) {
              (e as any).stopImmediatePropagation();
            }
            return false; 
          }} 
          onKeyDown={(e: KeyboardEvent<HTMLFormElement>) => {
            // Prevent form submission on Enter key
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          noValidate
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  // Prevent form submission on Enter key
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email || apiError ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  // Prevent form submission on Enter key
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password || apiError ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

