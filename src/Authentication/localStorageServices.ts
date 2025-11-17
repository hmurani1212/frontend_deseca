// localStorage management utilities

export const getLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    // console.error(`Error getting localStorage key ${key}:`, error);
    return null;
  }
};

export const setLocalStorage = (key: string, value: any): boolean => {
  try {
    // If value is a string, store as-is; otherwise stringify
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    // console.error(`Error setting localStorage key ${key}:`, error);
    return false;
  }
};

export const removeLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    // console.error(`Error removing localStorage key ${key}:`, error);
    return false;
  }
};

export const clearAuthData = (): void => {
  removeLocalStorage('access_token');
  removeLocalStorage('refresh_token');
  removeLocalStorage('user_data');
  removeLocalStorage('user_id');
  removeLocalStorage('user_email');
  removeLocalStorage('user_role');
};

