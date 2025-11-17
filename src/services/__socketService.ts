import io from 'socket.io-client';
import { getLocalStorage } from '../Authentication/localStorageServices';

/**
 * Socket.IO Service
 * 
 * Manages Socket.IO connection for real-time updates.
 * Handles connection, authentication, and event listeners.
 */

type Socket = ReturnType<typeof io>;

class SocketService {
  private socket: Socket | null = null;
  private is_connected: boolean = false;
  private reconnect_attempts: number = 0;
  private max_reconnect_attempts: number = 5;
  // Use BASE_URL from environment or default to localhost:3000
  // Socket.IO connects to the same server as the API
  private base_url: string =  'https://backenddeseca-production.up.railway.app'

  /**
   * Connect to Socket.IO server
   * 
   * @param onConnect - Callback when connected
   * @param onDisconnect - Callback when disconnected
   * @param onError - Callback on error
   */
  connect(
    onConnect?: () => void,
    onDisconnect?: (reason: string) => void,
    onError?: (error: Error) => void
  ): void {
    if (this.socket && this.socket.connected) {
      if (onConnect) onConnect();
      return;
    }

    const token = getLocalStorage('access_token');
    
    if (!token) {
      if (onError) onError(new Error('No access token found'));
      return;
    }

    this.socket = io(this.base_url, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.max_reconnect_attempts,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      this.is_connected = true;
      this.reconnect_attempts = 0;
      if (onConnect) onConnect();
    });

    this.socket.on('disconnect', (reason: string) => {
      this.is_connected = false;
      if (onDisconnect) onDisconnect(reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      this.reconnect_attempts++;
      
      if (this.reconnect_attempts >= this.max_reconnect_attempts) {
        if (onError) onError(error);
      }
    });

    this.socket.on('error', (error: Error) => {
      if (onError) onError(error);
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.is_connected = false;
    }
  }

  /**
   * Subscribe to an event
   * 
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      return;
    }

    this.socket.on(event, (...args: any[]) => {
      callback(...args);
    });
  }

  /**
   * Unsubscribe from an event
   * 
   * @param event - Event name
   * @param callback - Optional callback function (if provided, only that callback is removed)
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Emit an event to the server
   * 
   * @param event - Event name
   * @param data - Data to emit
   */
  emit(event: string, data?: any): void {
    if (!this.socket || !this.is_connected) {
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Check if socket is connected
   * 
   * @returns True if connected
   */
  isConnected(): boolean {
    return this.is_connected && this.socket !== null && this.socket.connected;
  }

  /**
   * Get socket instance (for advanced usage)
   * 
   * @returns Socket instance or null
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

