import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
  profileImage?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.rawhahbooking.com';
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  VERIFY_EMAIL: '/auth/verify-email',
  VERIFY_2FA: '/auth/verify-2fa',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/auth/profile',
  ADMIN_LOGIN: '/auth/admin/login',
  USERS: '/admin/users',
};

// Storage keys
const STORAGE_KEYS = {
  USER: '@rawhah_user',
  TOKENS: '@rawhah_tokens',
  AUTH_STATE: '@rawhah_auth_state',
};

// Error classes
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// HTTP client
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const tokens = await AuthService.getTokens();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 && tokens) {
        try {
          await AuthService.refreshTokens();
          // Retry the request with new token
          return apiRequest(endpoint, options);
        } catch (refreshError) {
          await AuthService.logout();
          throw new AuthError('Session expired. Please login again.', 'TOKEN_EXPIRED', 401);
        }
      }

      throw new AuthError(
        data.message || 'Request failed',
        data.code,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Network error occurred');
  }
};

// Authentication Service
export class AuthService {
  private static authState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
  };

  private static listeners: Array<(state: AuthState) => void> = [];

  // Subscribe to auth state changes
  static subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of state changes
  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Update auth state
  private static updateState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  // Initialize auth state from storage
  static async initialize(): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      const [storedUser, storedTokens] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKENS),
      ]);

      if (storedUser && storedTokens) {
        const user: User = JSON.parse(storedUser);
        const tokens: AuthTokens = JSON.parse(storedTokens);

        // Check if tokens are still valid
        if (tokens.expiresAt > Date.now()) {
          this.updateState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } else {
          // Try to refresh tokens
          try {
            await this.refreshTokens();
            return;
          } catch (error) {
            // Clear invalid tokens
            await this.clearStorage();
          }
        }
      }

      this.updateState({ isLoading: false });
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.updateState({ isLoading: false });
    }
  }

  // User login
  static async login(credentials: LoginRequest): Promise<User> {
    try {
      this.updateState({ isLoading: true });

      const response = await apiRequest<{
        user: User;
        tokens: AuthTokens;
        requiresTwoFactor?: boolean;
      }>(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.requiresTwoFactor) {
        this.updateState({ isLoading: false });
        throw new AuthError('Two-factor authentication required', 'REQUIRES_2FA');
      }

      await this.storeAuthData(response.user, response.tokens);
      
      this.updateState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.user;
    } catch (error) {
      this.updateState({ isLoading: false });
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Login failed');
    }
  }

  // Admin login with enhanced security
  static async adminLogin(credentials: LoginRequest): Promise<User> {
    try {
      this.updateState({ isLoading: true });

      const response = await apiRequest<{
        user: User;
        tokens: AuthTokens;
        requiresTwoFactor?: boolean;
      }>(AUTH_ENDPOINTS.ADMIN_LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.requiresTwoFactor) {
        this.updateState({ isLoading: false });
        throw new AuthError('Two-factor authentication required', 'REQUIRES_2FA');
      }

      // Verify admin role
      if (!['admin', 'super_admin'].includes(response.user.role)) {
        throw new AuthError('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      }

      await this.storeAuthData(response.user, response.tokens);
      
      this.updateState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.user;
    } catch (error) {
      this.updateState({ isLoading: false });
      throw error;
    }
  }

  // User registration
  static async register(userData: RegisterRequest): Promise<User> {
    try {
      this.updateState({ isLoading: true });

      const response = await apiRequest<{
        user: User;
        tokens: AuthTokens;
        requiresEmailVerification?: boolean;
      }>(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.requiresEmailVerification) {
        this.updateState({ isLoading: false });
        Alert.alert(
          'Email Verification Required',
          'Please check your email and verify your account before logging in.'
        );
        return response.user;
      }

      await this.storeAuthData(response.user, response.tokens);
      
      this.updateState({
        user: response.user,
        tokens: response.tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.user;
    } catch (error) {
      this.updateState({ isLoading: false });
      throw error;
    }
  }

  // Refresh tokens
  static async refreshTokens(): Promise<AuthTokens> {
    try {
      const currentTokens = await this.getTokens();
      if (!currentTokens?.refreshToken) {
        throw new AuthError('No refresh token available');
      }

      const response = await apiRequest<{ tokens: AuthTokens }>(
        AUTH_ENDPOINTS.REFRESH,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
        }
      );

      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(response.tokens));
      
      this.updateState({ tokens: response.tokens });
      return response.tokens;
    } catch (error) {
      await this.logout();
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const tokens = await this.getTokens();
      
      if (tokens?.accessToken) {
        // Notify server of logout
        await apiRequest(AUTH_ENDPOINTS.LOGOUT, {
          method: 'POST',
        }).catch(() => {
          // Ignore logout API errors
        });
      }
    } finally {
      await this.clearStorage();
      this.updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Get tokens
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TOKENS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiRequest<{ user: User }>(AUTH_ENDPOINTS.PROFILE, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      this.updateState({ user: response.user });

      return response.user;
    } catch (error) {
      throw new AuthError('Profile update failed');
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    await apiRequest(AUTH_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Verify 2FA code
  static async verify2FA(code: string): Promise<User> {
    const response = await apiRequest<{
      user: User;
      tokens: AuthTokens;
    }>(AUTH_ENDPOINTS.VERIFY_2FA, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    await this.storeAuthData(response.user, response.tokens);
    
    this.updateState({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });

    return response.user;
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    await apiRequest(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Check permissions
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Admin permissions
    if (user.role === 'admin') {
      const adminPermissions = [
        'view_dashboard',
        'manage_bookings',
        'manage_markup',
        'view_analytics',
        'manage_users',
      ];
      return adminPermissions.includes(permission);
    }

    // User permissions
    const userPermissions = [
      'view_profile',
      'edit_profile',
      'make_booking',
      'view_bookings',
    ];
    return userPermissions.includes(permission);
  }

  // Check if user has admin role
  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? ['admin', 'super_admin'].includes(user.role) : false;
  }

  // Get auth state
  static getAuthState(): AuthState {
    return this.authState;
  }

  // Private helper methods
  private static async storeAuthData(user: User, tokens: AuthTokens): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens)),
    ]);
  }

  private static async clearStorage(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKENS),
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_STATE),
    ]);
  }
}

// User Management Service (Admin only)
export class UserManagementService {
  // Get all users (admin only)
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    return apiRequest<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${AUTH_ENDPOINTS.USERS}?${queryParams}`);
  }

  // Get user by ID
  static async getUser(userId: string): Promise<User> {
    const response = await apiRequest<{ user: User }>(`${AUTH_ENDPOINTS.USERS}/${userId}`);
    return response.user;
  }

  // Update user (admin only)
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await apiRequest<{ user: User }>(`${AUTH_ENDPOINTS.USERS}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  }

  // Delete user (admin only)
  static async deleteUser(userId: string): Promise<void> {
    await apiRequest(`${AUTH_ENDPOINTS.USERS}/${userId}`, {
      method: 'DELETE',
    });
  }

  // Create user (admin only)
  static async createUser(userData: RegisterRequest & { role?: string }): Promise<User> {
    const response = await apiRequest<{ user: User }>(AUTH_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.user;
  }
}

export default AuthService; 