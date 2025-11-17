# Social Media Analytics Platform - Frontend Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Key Components & Responsibilities](#key-components--responsibilities)
6. [Authentication System](#authentication-system)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Services & Utilities](#services--utilities)
10. [Routing System](#routing-system)
11. [Styling & Theming](#styling--theming)
12. [Development Guidelines](#development-guidelines)
13. [Environment Setup](#environment-setup)
14. [Common Patterns & Best Practices](#common-patterns--best-practices)

---

## Project Overview

This is a **Social Media Analytics Platform Frontend** built with React and TypeScript. The application allows users to:

- **Authenticate** (Login/Register) with JWT-based authentication
- **Manage Posts** - Create, edit, delete, and view social media posts across multiple platforms (Twitter, Facebook, Instagram, LinkedIn)
- **View Dashboard** - Overview with key metrics, charts, and top posts
- **Analyze Performance** - View analytics including optimal posting times, engagement trends, platform performance, and top performing posts
- **Post Analytics** - Detailed analytics for individual posts

The application follows the **MVVM (Model-View-ViewModel)** architectural pattern for clean separation of concerns and maintainability.

---

## Architecture

### MVVM Pattern

The application is structured using the **Model-View-ViewModel (MVVM)** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                         VIEW                            │
│  (React Components - UI Layer)                          │
│  - User Interface                                       │
│  - User Interactions                                    │
│  - Displays Data                                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Observes & Updates
                   │
┌──────────────────▼──────────────────────────────────────┐
│                      VIEWMODEL                          │
│  (Business Logic & State Management)                    │
│  - Zustand Stores                                       │
│  - Business Logic                                       │
│  - State Management                                     │
│  - Data Transformation                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Calls
                   │
┌──────────────────▼──────────────────────────────────────┐
│                        MODEL                            │
│  (API Layer - Data Access)                              │
│  - Axios Instances                                      │
│  - API Endpoints                                        │
│  - HTTP Requests                                        │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

1. **Model Layer** (`src/Model/`)
   - Contains all API calls and HTTP request definitions
   - Uses Axios for HTTP requests
   - No business logic, only data fetching

2. **ViewModel Layer** (`src/ViewModel/`)
   - Contains business logic and state management
   - Uses Zustand for state management
   - Transforms data from Model layer
   - Handles loading states and error handling

3. **View Layer** (`src/View/`)
   - Contains React components (UI)
   - Consumes ViewModel state and actions
   - Handles user interactions
   - No direct API calls

---

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI library
- **TypeScript 4.9.5** - Type safety
- **React Router v6** - Client-side routing

### State Management
- **Zustand 4.4.3** - Lightweight state management

### HTTP Client
- **Axios 1.6.1** - HTTP requests with interceptors

### UI Libraries
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Material Tailwind React 2.1.8** - Material Design components
- **Framer Motion 10.16.16** - Animation library
- **React Icons 4.12.0** - Icon library

### Forms & Validation
- **React Hook Form 7.49.2** - Form management
- **Yup 1.3.3** - Schema validation

### Data Visualization
- **Recharts 2.10.3** - Chart library
- **Chart.js 4.4.1** - Chart library
- **React Chart.js 2 5.2.0** - React wrapper for Chart.js

### Utilities
- **JWT Decode 4.0.0** - JWT token decoding
- **Date-fns 2.30.0** - Date manipulation
- **Socket.io Client 4.8.1** - Real-time communication
- **React Toastify 9.1.3** - Toast notifications
- **jsPDF 3.0.3** - PDF generation
- **jsPDF AutoTable 5.0.2** - PDF table generation
- **React Circular Progressbar 2.1.0** - Progress indicators

### Build Tools
- **React Scripts 5.0.1** - Create React App build tools
- **PostCSS 8.4.32** - CSS processing
- **Autoprefixer 10.4.16** - CSS vendor prefixing

---

## Project Structure

```
src/
├── Authentication/              # Authentication utilities
│   ├── jwt_decode.ts           # JWT token decoding utilities
│   └── localStorageServices.ts # localStorage management
│
├── Components/                  # Reusable UI components
│   ├── CircularProgress/       # Loading spinner component
│   ├── ConfirmationDialog/     # Confirmation modal
│   ├── CustomCard/             # Custom card component
│   ├── CustomDrawer/           # Custom drawer component
│   ├── ErrorBoundary/          # Error boundary component
│   ├── Layout/                 # Main layout with sidebar
│   ├── ProtectedRoute/         # Route protection component
│   └── Toaster/                # Toast notification service
│
├── Model/                      # API Layer (Data Access)
│   ├── base.ts                 # Axios instance configuration
│   ├── BaseUri.ts              # API endpoints definition
│   └── Data/                   # API modules by feature
│       ├── Auth/               # Authentication API
│       ├── Posts/              # Posts API
│       ├── Analytics/          # Analytics API
│       └── Dashboard/          # Dashboard API
│
├── ViewModel/                  # Business Logic Layer
│   ├── AuthViewModel/          # Authentication state & logic
│   ├── PostsViewModel/         # Posts state & logic
│   ├── AnalyticsViewModel/     # Analytics state & logic
│   └── DashboardViewModel/     # Dashboard state & logic
│
├── View/                       # UI Components (Pages)
│   ├── Auth/                   # Authentication pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Dashboard/              # Dashboard page
│   │   └── Dashboard.tsx
│   ├── Posts/                  # Posts pages
│   │   ├── Posts.tsx           # Posts list
│   │   ├── CreatePost.tsx      # Create post
│   │   ├── CreatePostForm.tsx  # Post form component
│   │   ├── EditPost.tsx        # Edit post
│   │   └── PostAnalytics.tsx   # Post analytics
│   └── Analytics/              # Analytics page
│       └── Analytics.tsx
│
├── Routers/                    # Route definitions
│   └── Routers.tsx             # Main router configuration
│
├── services/                   # Utility services
│   ├── __axiosInterceptors.ts  # Axios request/response interceptors
│   ├── __authErrorHandler.ts   # Authentication error handling
│   ├── __dateTimeServices.ts   # Date/time utilities
│   ├── __debounceServices.ts   # Debounce utility
│   └── __socketService.ts      # Socket.IO service
│
├── Store/                      # Zustand store configuration
│   └── store.ts                # Root store combining all ViewModels
│
├── Theme/                      # Theme configuration
│   └── Theme.ts                # Material Tailwind theme
│
├── App.tsx                     # Root component
├── index.tsx                   # Application entry point
└── index.css                   # Global styles
```

---

## Key Components & Responsibilities

### 1. Authentication Components

#### `src/Authentication/jwt_decode.ts`
- **Purpose**: JWT token utilities
- **Functions**:
  - `getToken()`: Retrieves access token from localStorage
  - `decodeToken()`: Decodes JWT token to extract user data
  - `getUserData()`: Gets user information from token or localStorage
  - `isTokenValid()`: Checks if token is expired

#### `src/Authentication/localStorageServices.ts`
- **Purpose**: localStorage management utilities
- **Functions**:
  - `getLocalStorage(key)`: Gets value from localStorage (with JSON parsing)
  - `setLocalStorage(key, value)`: Sets value in localStorage
  - `removeLocalStorage(key)`: Removes key from localStorage
  - `clearAuthData()`: Clears all authentication-related data

### 2. Core Components

#### `src/Components/ProtectedRoute/ProtectedRoute.tsx`
- **Purpose**: Protects routes that require authentication
- **Functionality**:
  - Checks if user is authenticated
  - Redirects to `/login` if not authenticated
  - Wraps protected routes with Layout component

#### `src/Components/Layout/Layout.tsx`
- **Purpose**: Main application layout with sidebar navigation
- **Features**:
  - Responsive sidebar (mobile/desktop)
  - Navigation menu (Dashboard, Posts, Analytics)
  - User profile section
  - Logout functionality
  - Mobile hamburger menu

#### `src/Components/ErrorBoundary/ErrorBoundary.tsx`
- **Purpose**: Catches React errors and displays fallback UI
- **Features**:
  - Catches component errors
  - Displays user-friendly error message
  - Shows error details in development mode
  - Provides reset functionality

#### `src/Components/Toaster/Toaster.ts`
- **Purpose**: Toast notification service
- **Function**: `showToast(message, type)` - Shows toast notifications
- **Types**: success, error, warning, info

### 3. Model Layer (API)

#### `src/Model/base.ts`
- **Purpose**: Axios instance configuration
- **Features**:
  - Base URL configuration
  - Timeout settings (30 seconds)
  - Content-Type headers
  - Auth interceptors setup

#### `src/Model/BaseUri.ts`
- **Purpose**: Centralized API endpoint definitions
- **Endpoints**:
  - `AUTH`: Register, Login, Refresh, Logout
  - `POSTS`: CRUD operations, Analytics
  - `ANALYTICS`: Optimal times, Trends, Performance, Top posts
  - `DASHBOARD`: Overview

#### Model Modules (`src/Model/Data/`)
Each module contains API functions for a specific feature:
- **Auth.ts**: Authentication API calls
- **Posts.ts**: Posts API calls with filtering, pagination, search
- **Analytics.ts**: Analytics API calls
- **Dashboard.ts**: Dashboard API calls

### 4. ViewModel Layer (State Management)

#### `src/Store/store.ts`
- **Purpose**: Root Zustand store
- **Functionality**:
  - Combines all ViewModels into single store
  - Enables Zustand DevTools
  - Exports `useStore` hook and `RootState` type

#### ViewModel Modules (`src/ViewModel/`)
Each ViewModel manages state and business logic for a feature:

**AuthViewModel** (`src/ViewModel/AuthViewModel/Auth.ts`):
- State: `isAuthenticated`, `isAuthLoading`, `user`, `accessToken`
- Actions: `register()`, `login()`, `logout()`, `refreshAccessToken()`, `initializeAuth()`

**PostsViewModel** (`src/ViewModel/PostsViewModel/Posts.ts`):
- State: `posts`, `currentPost`, `postAnalytics`, `pagination`, `filters`, loading states
- Actions: `getPostsList()`, `getPostById()`, `createPost()`, `updatePost()`, `deletePost()`, `getPostAnalytics()`, `setFilters()`, `loadMorePosts()`, `searchPosts()`

**AnalyticsViewModel** (`src/ViewModel/AnalyticsViewModel/Analytics.ts`):
- State: `optimalTimes`, `trends`, `platformPerformance`, `topPosts`, `performanceComparison`, loading states
- Actions: `getOptimalTimes()`, `getTrends()`, `getPlatformPerformance()`, `getTopPosts()`, `getPerformanceComparison()`

**DashboardViewModel** (`src/ViewModel/DashboardViewModel/Dashboard.ts`):
- State: `overview`, `isLoadingOverview`
- Actions: `getOverview()`, `updateOverview()`

### 5. Services

#### `src/services/__axiosInterceptors.ts`
- **Purpose**: Axios request/response interceptors
- **Request Interceptor**:
  - Adds Authorization header with access token
  - Gets fresh token from localStorage for each request

- **Response Interceptor**:
  - Handles new access tokens from response headers
  - Handles 401 errors (token expired)
  - Automatic token refresh on expiration
  - Queues failed requests during token refresh
  - Prevents auth error handling on login/register endpoints

#### `src/services/__authErrorHandler.ts`
- **Purpose**: Centralized authentication error handling
- **Features**:
  - Detects authentication errors (401, 403, specific error codes)
  - Shows error messages
  - Redirects to login on auth failures
  - Prevents redirect loops on login/register pages
  - Clears auth data on logout

#### `src/services/__dateTimeServices.ts`
- **Purpose**: Date and time utility functions
- **Functions**:
  - `convertDMY()`: Converts timestamp to DD/MM/YYYY
  - `convertTimeAMPM()`: Converts timestamp to 12-hour format
  - `toUnixTimeStamp()`: Converts date to Unix timestamp
  - `formatDateYMD()`: Formats date as YYYY-MM-DD
  - `formatTimestampToDate()`: Formats timestamp to date string
  - `formatDateDMY()`: Formats date as DD Month YYYY
  - `formatTimestampToTime()`: Formats timestamp to time
  - `secondsIntoHrs()`: Converts seconds to hours/minutes
  - `getFormattedDate()`: Gets formatted current date
  - `formatTimeTo12Hour()`: Formats time string to 12-hour format

#### `src/services/__debounceServices.ts`
- **Purpose**: Debounce utility hook
- **Function**: `useDebounce(callback, delay)` - Debounces function calls

#### `src/services/__socketService.ts`
- **Purpose**: Socket.IO client service
- **Features**:
  - Singleton pattern
  - Connection management
  - Authentication with JWT token
  - Event subscription/unsubscription
  - Reconnection handling
  - Connection status checking

### 6. Routing

#### `src/Routers/Routers.tsx`
- **Purpose**: Application routing configuration
- **Routes**:
  - **Public Routes**:
    - `/login` - Login page
    - `/register` - Registration page
  - **Protected Routes** (wrapped with `ProtectedRoute`):
    - `/dashboard` - Dashboard page
    - `/posts` - Posts list
    - `/posts/create` - Create post
    - `/posts/:id/edit` - Edit post
    - `/posts/:id/analytics` - Post analytics
    - `/analytics` - Analytics page
  - **Default**: Redirects `/` to `/dashboard`

- **Features**:
  - Lazy loading for all routes (code splitting)
  - Suspense with loading fallback
  - Protected route wrapper

### 7. Entry Points

#### `src/index.tsx`
- **Purpose**: Application entry point
- **Features**:
  - React 18 root API
  - BrowserRouter setup
  - ThemeProvider (Material Tailwind)
  - Global error handlers (filters browser extension errors)
  - Global styles import

#### `src/App.tsx`
- **Purpose**: Root component
- **Features**:
  - Initializes authentication on mount
  - Shows loading screen during auth initialization
  - Prevents loading screen on login/register pages
  - ErrorBoundary wrapper
  - ToastContainer configuration
  - Router rendering

---

## Authentication System

### Authentication Flow

1. **Registration/Login**:
   ```
   User submits form → ViewModel calls Model API → 
   Backend validates → Returns access_token + user data → 
   Store in localStorage → Update Zustand state → 
   Redirect to dashboard
   ```

2. **Token Management**:
   - Access token stored in localStorage
   - Refresh token stored in database (backend)
   - Token automatically attached to all requests via interceptors
   - Token validation on app initialization

3. **Token Refresh**:
   ```
   401 Error → Check if token expired → 
   Call refresh API → Update access token → 
   Retry original request → Process queued requests
   ```

4. **Logout**:
   ```
   User clicks logout → Call logout API → 
   Clear localStorage → Clear Zustand state → 
   Redirect to login
   ```

### Authentication State

Stored in `AuthViewModel`:
- `isAuthenticated`: Boolean indicating auth status
- `isAuthLoading`: Loading state during auth operations
- `user`: User object with id, email, name, role
- `accessToken`: Current access token

### Protected Routes

All routes except `/login` and `/register` are protected:
- `ProtectedRoute` component checks authentication
- Redirects to `/login` if not authenticated
- Wraps content with Layout component

### Session Persistence

- Tokens stored in localStorage
- On app reload, `initializeAuth()` checks token validity
- If valid, restores session
- If expired, attempts token refresh
- If refresh fails, clears session

---

## State Management

### Zustand Store Structure

The application uses Zustand for state management with a feature-based organization:

```typescript
Store
├── AuthState (from AuthViewModel)
├── PostsState (from PostsViewModel)
├── AnalyticsState (from AnalyticsViewModel)
└── DashboardState (from DashboardViewModel)
```

### Store Usage Pattern

```typescript
// In components
const user = useStore((state: RootState) => state.user);
const login = useStore((state: RootState) => state.login);
const posts = useStore((state: RootState) => state.posts);
const getPostsList = useStore((state: RootState) => state.getPostsList);
```

### State Updates

- ViewModels use Zustand's `set()` function to update state
- State updates trigger component re-renders
- Loading states managed per feature
- Error states handled in ViewModels

### State Persistence

- Authentication state persisted in localStorage
- Other state is in-memory (cleared on page refresh)
- Posts filters and pagination reset on page refresh

---

## API Integration

### API Response Format

All API responses follow this structure:

```typescript
{
  STATUS: 'SUCCESSFUL' | 'FAILED',
  DB_DATA: any,  // Actual data
  ERROR_CODE?: string,
  ERROR_DESCRIPTION?: string,
  ERROR_FILTER?: string
}
```

### API Error Handling

1. **Network Errors**: Caught in ViewModels, returned as error objects
2. **HTTP Errors**: Extracted from `response.data.ERROR_DESCRIPTION`
3. **Authentication Errors**: Handled by interceptors, redirected to login
4. **Validation Errors**: Displayed in forms via error messages

### Request Configuration

- **Base URL**: From `REACT_APP_API_BASE_URL` environment variable
- **Timeout**: 30 seconds
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (added by interceptor)

### API Modules

Each feature has its own API module:
- **Auth API**: `/api/auth/*`
- **Posts API**: `/api/posts/*`
- **Analytics API**: `/api/analytics/*`
- **Dashboard API**: `/api/dashboard/*`

---

## Services & Utilities

### Axios Interceptors

**Request Interceptor**:
- Adds Authorization header with access token
- Gets fresh token from localStorage for each request

**Response Interceptor**:
- Checks for new access token in response headers (`x-new-access-token`)
- Handles 401 errors with automatic token refresh
- Queues failed requests during token refresh
- Prevents auth error handling on login/register endpoints

### Date/Time Utilities

Comprehensive date/time formatting functions:
- Unix timestamp conversion
- Multiple date formats (DMY, YMD, etc.)
- 12-hour time format
- Duration formatting (seconds to hours/minutes)

### Debounce Service

Custom React hook for debouncing function calls:
```typescript
const debouncedSearch = useDebounce(searchFunction, 500);
```

### Socket Service

Singleton Socket.IO service for real-time updates:
- Automatic connection management
- JWT authentication
- Event subscription/unsubscription
- Reconnection handling

---

## Routing System

### Route Configuration

Routes defined in `src/Routers/Routers.tsx`:
- Uses React Router v6
- Lazy loading for code splitting
- Suspense for loading states
- Protected routes with authentication check

### Navigation

- Programmatic navigation: `useNavigate()` hook
- Link navigation: `<NavLink>` component
- Active route highlighting in sidebar

### Route Protection

- `ProtectedRoute` component wraps protected routes
- Checks authentication state
- Redirects to login if not authenticated
- Wraps content with Layout component

---

## Styling & Theming

### Tailwind CSS

- Utility-first CSS framework
- Custom color palette defined in `tailwind.config.js`
- Responsive design with breakpoints
- Custom utilities for navigation links

### Material Tailwind

- Material Design components
- Theme configuration in `src/Theme/Theme.ts`
- Drawer component customization

### Custom Styles

- Global styles in `src/index.css`
- Custom scrollbar styles
- Navigation link hover effects
- Custom color palette

### Color Palette

Defined in `tailwind.config.js`:
- Primary colors (indigo)
- Custom colors (blue, red, gray, green, orange, yellow)
- Material Tailwind integration

---

## Development Guidelines

### Code Organization

1. **Follow MVVM Pattern**:
   - Models: API calls only
   - ViewModels: Business logic and state
   - Views: UI components only

2. **File Naming**:
   - Components: PascalCase (e.g., `Login.tsx`)
   - Utilities: camelCase (e.g., `jwt_decode.ts`)
   - Services: camelCase with `__` prefix (e.g., `__axiosInterceptors.ts`)

3. **Import Organization**:
   - React imports first
   - Third-party libraries
   - Internal imports (absolute paths preferred)
   - Type imports

### TypeScript Guidelines

1. **Type Definitions**:
   - Define interfaces for all data structures
   - Use type inference where possible
   - Avoid `any` type (use `unknown` if needed)

2. **Component Props**:
   - Always define prop interfaces
   - Use `React.FC` or explicit function types

3. **State Management**:
   - Define state interfaces in ViewModels
   - Use Zustand's type inference for RootState

### Error Handling

1. **API Errors**:
   - Handle in ViewModels
   - Return error objects with success flag
   - Display user-friendly messages

2. **Component Errors**:
   - Use ErrorBoundary for error catching
   - Display fallback UI
   - Log errors for debugging

3. **Form Validation**:
   - Client-side validation before API calls
   - Display validation errors in forms
   - Clear errors on user input

### State Management Best Practices

1. **Loading States**:
   - Separate loading states per operation
   - Prevent duplicate API calls
   - Show loading indicators in UI

2. **Error States**:
   - Store error messages in state
   - Clear errors on new operations
   - Display errors to users

3. **Data Updates**:
   - Update local state after successful API calls
   - Refresh lists after create/update/delete
   - Optimistic updates where appropriate

### Performance Optimization

1. **Code Splitting**:
   - Lazy load all routes
   - Use React.lazy() and Suspense

2. **Memoization**:
   - Use React.memo() for expensive components
   - Use useMemo() for expensive calculations
   - Use useCallback() for event handlers

3. **API Calls**:
   - Debounce search inputs
   - Prevent duplicate requests
   - Cache data where appropriate

---

## Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create `.env` file in root directory:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3000
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App (irreversible)

### Build Configuration

- Build output: `build/` directory
- Production optimizations: Minification, code splitting, tree shaking
- Environment variables: Must be prefixed with `REACT_APP_`

---

## Common Patterns & Best Practices

### 1. ViewModel Pattern

```typescript
// ViewModel structure
const featureViewModel: StateCreator<FeatureState> = (set, get, api) => ({
  // State
  data: null,
  isLoading: false,
  
  // Actions
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const response = await featureApi.getData();
      set({ data: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  }
});
```

### 2. Component Pattern

```typescript
// Component structure
const FeatureComponent: React.FC = () => {
  // Get state and actions from store
  const data = useStore((state: RootState) => state.data);
  const fetchData = useStore((state: RootState) => state.fetchData);
  
  // Local state
  const [localState, setLocalState] = useState();
  
  // Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // Render
  return <div>{/* UI */}</div>;
};
```

### 3. API Call Pattern

```typescript
// Model API function
const featureApi = {
  getData: function (params: Params): AxiosPromise {
    return axiosInstance.request({
      method: 'GET',
      url: API_ENDPOINTS.FEATURE.BASE,
      params: params
    });
  }
};
```

### 4. Error Handling Pattern

```typescript
// ViewModel error handling
try {
  const response = await api.call();
  if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL') {
    return { success: true, data: response.data.DB_DATA };
  } else {
    return { 
      success: false, 
      error: response.data.ERROR_DESCRIPTION || 'Operation failed' 
    };
  }
} catch (err: any) {
  return { 
    success: false, 
    error: err.response?.data?.ERROR_DESCRIPTION || err.message || 'Operation failed' 
  };
}
```

### 5. Form Handling Pattern

```typescript
// Form state and validation
const [formData, setFormData] = useState<FormData>({});
const [errors, setErrors] = useState<FormErrors>({});

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (validate()) {
    const result = await submitForm(formData);
    if (result.success) {
      showToast('Success!', 'success');
    } else {
      showToast(result.error, 'error');
    }
  }
};
```

### 6. Loading State Pattern

```typescript
// Prevent duplicate calls
if (isLoading || requestInProgress) {
  return { success: false, error: 'Request already in progress' };
}

set({ isLoading: true, requestInProgress: true });
// ... API call
set({ isLoading: false, requestInProgress: false });
```

### 7. Filter/Pagination Pattern

```typescript
// Filters and pagination
const [filters, setFilters] = useState<Filters>({});
const [pagination, setPagination] = useState<Pagination>({
  page: 1,
  limit: 20,
  total: 0
});

const loadData = async (loadMore = false) => {
  const page = loadMore ? pagination.page + 1 : 1;
  const result = await getData({ ...filters, page, limit: pagination.limit });
  // Update state
};
```

---

## Key Features Explained

### 1. Authentication Flow

- **Registration**: User creates account → Backend creates user → Returns tokens → Store in localStorage
- **Login**: User authenticates → Backend validates → Returns tokens → Store in localStorage
- **Token Refresh**: Automatic on 401 errors → Refresh token used → New access token stored
- **Logout**: Clear localStorage → Clear state → Redirect to login

### 2. Post Management

- **List Posts**: Pagination, filtering (status, platform), search, sorting
- **Create Post**: Form validation → API call → Refresh list
- **Edit Post**: Load post data → Form pre-filled → Update → Refresh list
- **Delete Post**: Confirmation → API call → Remove from list
- **Post Analytics**: Detailed metrics for individual posts

### 3. Analytics

- **Optimal Times**: Best times to post for maximum engagement
- **Trends**: Engagement trends (hourly, daily, weekly)
- **Platform Performance**: Performance comparison across platforms
- **Top Posts**: Best performing posts
- **Performance Comparison**: Period-over-period comparison

### 4. Dashboard

- **Overview**: Key metrics, charts, top posts
- **Real-time Updates**: Socket.IO integration for live updates
- **Metrics**: Total posts, engagement, platform breakdown

---

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Check localStorage for tokens
   - Verify token expiration
   - Check API base URL

2. **API Errors**:
   - Check network tab for request/response
   - Verify API endpoint URLs
   - Check CORS settings

3. **State Not Updating**:
   - Verify Zustand store usage
   - Check if state is being set correctly
   - Verify component is subscribed to state

4. **Routing Issues**:
   - Check route paths match exactly
   - Verify ProtectedRoute is working
   - Check authentication state

5. **Build Issues**:
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

---

## Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)

### Project-Specific
- Check `README.md` for project overview
- Review `package.json` for dependencies
- Check `tsconfig.json` for TypeScript configuration

---

## Conclusion

This guide provides a comprehensive overview of the Social Media Analytics Platform Frontend. The application follows the MVVM pattern for clean architecture, uses Zustand for state management, and implements best practices for React/TypeScript development.

For specific implementation details, refer to the source code in each module. The codebase is well-organized and follows consistent patterns throughout.

---

**Last Updated**: Based on current codebase structure
**Version**: 1.0.0

