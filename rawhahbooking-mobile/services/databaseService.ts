import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarkupRule } from './duffelApi';
import { User } from './authService';

// Database configuration
const DATABASE_VERSION = 1;
const STORAGE_PREFIX = '@rawhah_db_';

// Storage keys
const STORAGE_KEYS = {
  MARKUP_RULES: `${STORAGE_PREFIX}markup_rules`,
  BOOKINGS: `${STORAGE_PREFIX}bookings`,
  ANALYTICS: `${STORAGE_PREFIX}analytics`,
  CACHE: `${STORAGE_PREFIX}cache`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  SYNC_QUEUE: `${STORAGE_PREFIX}sync_queue`,
};

// Types
export interface BookingRecord {
  id: string;
  userId: string;
  orderId: string;
  bookingReference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'flight' | 'hotel';
  totalAmount: number;
  currency: string;
  markupApplied?: {
    ruleId: string;
    amount: number;
    type: 'percentage' | 'fixed';
  };
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: 'adult' | 'child' | 'infant';
  }>;
  itinerary: any; // Flight or hotel details
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsRecord {
  id: string;
  date: string;
  metrics: {
    totalBookings: number;
    totalRevenue: number;
    totalMarkup: number;
    averageBookingValue: number;
    conversionRate: number;
    topRoutes: Array<{
      route: string;
      bookings: number;
      revenue: number;
    }>;
    userActivity: {
      newUsers: number;
      activeUsers: number;
      returningUsers: number;
    };
  };
  createdAt: string;
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  expiresAt: number;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'markup_rule' | 'booking' | 'user' | 'analytics';
  entityId: string;
  data: any;
  attempts: number;
  createdAt: string;
  lastAttemptAt?: string;
}

// Error handling
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Database Service
export class DatabaseService {
  // Initialize database
  static async initialize(): Promise<void> {
    try {
      // Check database version and migrate if needed
      const version = await AsyncStorage.getItem(`${STORAGE_PREFIX}version`);
      if (!version || parseInt(version) < DATABASE_VERSION) {
        await this.migrate(parseInt(version || '0'), DATABASE_VERSION);
        await AsyncStorage.setItem(`${STORAGE_PREFIX}version`, DATABASE_VERSION.toString());
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new DatabaseError('Database initialization failed');
    }
  }

  // Database migration
  private static async migrate(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`Migrating database from version ${fromVersion} to ${toVersion}`);
    
    // Add migration logic here as needed
    if (fromVersion < 1) {
      // Initial setup
      await this.clearAll();
    }
  }

  // Generic storage operations
  private static async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  private static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw new DatabaseError(`Failed to save ${key}`);
    }
  }

  private static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw new DatabaseError(`Failed to remove ${key}`);
    }
  }

  // Markup Rules operations
  static async getMarkupRules(): Promise<MarkupRule[]> {
    const rules = await this.getItem<MarkupRule[]>(STORAGE_KEYS.MARKUP_RULES);
    return rules || [];
  }

  static async saveMarkupRule(rule: MarkupRule): Promise<void> {
    const rules = await this.getMarkupRules();
    const existingIndex = rules.findIndex(r => r.id === rule.id);
    
    if (existingIndex >= 0) {
      rules[existingIndex] = { ...rule, updated_at: new Date().toISOString() };
    } else {
      rules.push({ ...rule, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    
    await this.setItem(STORAGE_KEYS.MARKUP_RULES, rules);
    
    // Add to sync queue
    await this.addToSyncQueue({
      type: existingIndex >= 0 ? 'update' : 'create',
      entity: 'markup_rule',
      entityId: rule.id,
      data: rule,
    });
  }

  static async deleteMarkupRule(ruleId: string): Promise<void> {
    const rules = await this.getMarkupRules();
    const filteredRules = rules.filter(r => r.id !== ruleId);
    await this.setItem(STORAGE_KEYS.MARKUP_RULES, filteredRules);
    
    // Add to sync queue
    await this.addToSyncQueue({
      type: 'delete',
      entity: 'markup_rule',
      entityId: ruleId,
      data: null,
    });
  }

  static async getMarkupRule(ruleId: string): Promise<MarkupRule | null> {
    const rules = await this.getMarkupRules();
    return rules.find(r => r.id === ruleId) || null;
  }

  // Bookings operations
  static async getBookings(userId?: string): Promise<BookingRecord[]> {
    const bookings = await this.getItem<BookingRecord[]>(STORAGE_KEYS.BOOKINGS) || [];
    return userId ? bookings.filter(b => b.userId === userId) : bookings;
  }

  static async saveBooking(booking: BookingRecord): Promise<void> {
    const bookings = await this.getBookings();
    const existingIndex = bookings.findIndex(b => b.id === booking.id);
    
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      bookings[existingIndex] = { ...booking, updatedAt: now };
    } else {
      bookings.push({ ...booking, createdAt: now, updatedAt: now });
    }
    
    await this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    
    // Add to sync queue
    await this.addToSyncQueue({
      type: existingIndex >= 0 ? 'update' : 'create',
      entity: 'booking',
      entityId: booking.id,
      data: booking,
    });
  }

  static async getBooking(bookingId: string): Promise<BookingRecord | null> {
    const bookings = await this.getBookings();
    return bookings.find(b => b.id === bookingId) || null;
  }

  static async updateBookingStatus(
    bookingId: string, 
    status: BookingRecord['status']
  ): Promise<void> {
    const bookings = await this.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex >= 0) {
      bookings[bookingIndex].status = status;
      bookings[bookingIndex].updatedAt = new Date().toISOString();
      await this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
      
      // Add to sync queue
      await this.addToSyncQueue({
        type: 'update',
        entity: 'booking',
        entityId: bookingId,
        data: bookings[bookingIndex],
      });
    }
  }

  // Analytics operations
  static async saveAnalytics(analytics: AnalyticsRecord): Promise<void> {
    const existingAnalytics = await this.getItem<AnalyticsRecord[]>(STORAGE_KEYS.ANALYTICS) || [];
    const existingIndex = existingAnalytics.findIndex(a => a.date === analytics.date);
    
    if (existingIndex >= 0) {
      existingAnalytics[existingIndex] = analytics;
    } else {
      existingAnalytics.push(analytics);
    }
    
    // Keep only last 90 days of analytics
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const filteredAnalytics = existingAnalytics.filter(
      a => new Date(a.date) >= cutoffDate
    );
    
    await this.setItem(STORAGE_KEYS.ANALYTICS, filteredAnalytics);
  }

  static async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsRecord[]> {
    const analytics = await this.getItem<AnalyticsRecord[]>(STORAGE_KEYS.ANALYTICS) || [];
    
    if (!startDate && !endDate) {
      return analytics;
    }
    
    return analytics.filter(a => {
      const date = new Date(a.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return date >= start && date <= end;
    });
  }

  static async generateAnalytics(date: string = new Date().toISOString().split('T')[0]): Promise<AnalyticsRecord> {
    const bookings = await this.getBookings();
    const dayBookings = bookings.filter(b => b.createdAt.split('T')[0] === date);
    
    const metrics = {
      totalBookings: dayBookings.length,
      totalRevenue: dayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      totalMarkup: dayBookings.reduce((sum, b) => sum + (b.markupApplied?.amount || 0), 0),
      averageBookingValue: dayBookings.length > 0 
        ? dayBookings.reduce((sum, b) => sum + b.totalAmount, 0) / dayBookings.length 
        : 0,
      conversionRate: 0, // This would need to be calculated based on search/booking ratio
      topRoutes: this.calculateTopRoutes(dayBookings),
      userActivity: {
        newUsers: 0, // This would need user registration data
        activeUsers: new Set(dayBookings.map(b => b.userId)).size,
        returningUsers: 0, // This would need historical user data
      },
    };

    const analytics: AnalyticsRecord = {
      id: `analytics_${date}`,
      date,
      metrics,
      createdAt: new Date().toISOString(),
    };

    await this.saveAnalytics(analytics);
    return analytics;
  }

  private static calculateTopRoutes(bookings: BookingRecord[]): Array<{
    route: string;
    bookings: number;
    revenue: number;
  }> {
    const routeMap = new Map<string, { bookings: number; revenue: number }>();
    
    bookings.forEach(booking => {
      if (booking.type === 'flight' && booking.itinerary?.route) {
        const route = booking.itinerary.route;
        const existing = routeMap.get(route) || { bookings: 0, revenue: 0 };
        routeMap.set(route, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + booking.totalAmount,
        });
      }
    });

    return Array.from(routeMap.entries())
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  // Cache operations
  static async setCache<T>(key: string, data: T, expirationMinutes: number = 60): Promise<void> {
    const cacheEntry: CacheEntry<T> = {
      key,
      data,
      expiresAt: Date.now() + (expirationMinutes * 60 * 1000),
      createdAt: new Date().toISOString(),
    };
    
    await this.setItem(`${STORAGE_KEYS.CACHE}_${key}`, cacheEntry);
  }

  static async getCache<T>(key: string): Promise<T | null> {
    const cacheEntry = await this.getItem<CacheEntry<T>>(`${STORAGE_KEYS.CACHE}_${key}`);
    
    if (!cacheEntry) {
      return null;
    }
    
    if (Date.now() > cacheEntry.expiresAt) {
      await this.removeItem(`${STORAGE_KEYS.CACHE}_${key}`);
      return null;
    }
    
    return cacheEntry.data;
  }

  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(`${STORAGE_KEYS.CACHE}_`));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Sync queue operations
  private static async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'attempts' | 'createdAt'>): Promise<void> {
    const queue = await this.getItem<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
    
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };
    
    queue.push(syncItem);
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.getItem<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
  }

  static async processSyncQueue(): Promise<void> {
    const queue = await this.getSyncQueue();
    const processedIds: string[] = [];
    
    for (const item of queue) {
      try {
        // Here you would make API calls to sync with server
        // For now, we'll just mark as processed
        console.log(`Processing sync item: ${item.type} ${item.entity} ${item.entityId}`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        processedIds.push(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        
        // Update attempt count
        item.attempts++;
        item.lastAttemptAt = new Date().toISOString();
        
        // Remove from queue if too many attempts
        if (item.attempts >= 5) {
          processedIds.push(item.id);
        }
      }
    }
    
    // Remove processed items from queue
    if (processedIds.length > 0) {
      const remainingQueue = queue.filter(item => !processedIds.includes(item.id));
      await this.setItem(STORAGE_KEYS.SYNC_QUEUE, remainingQueue);
    }
  }

  // Settings operations
  static async getSetting<T>(key: string, defaultValue?: T): Promise<T | null> {
    const settings = await this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {};
    return settings[key] !== undefined ? settings[key] : defaultValue || null;
  }

  static async setSetting<T>(key: string, value: T): Promise<void> {
    const settings = await this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {};
    settings[key] = value;
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Utility operations
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dbKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(dbKeys);
    } catch (error) {
      console.error('Error clearing database:', error);
      throw new DatabaseError('Failed to clear database');
    }
  }

  static async getStorageSize(): Promise<{ 
    totalKeys: number; 
    estimatedSize: number; 
    breakdown: Record<string, number> 
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dbKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      
      let totalSize = 0;
      const breakdown: Record<string, number> = {};
      
      for (const key of dbKeys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? new Blob([value]).size : 0;
        totalSize += size;
        
        const category = key.replace(STORAGE_PREFIX, '').split('_')[0];
        breakdown[category] = (breakdown[category] || 0) + size;
      }
      
      return {
        totalKeys: dbKeys.length,
        estimatedSize: totalSize,
        breakdown,
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { totalKeys: 0, estimatedSize: 0, breakdown: {} };
    }
  }

  // Export data for backup
  static async exportData(): Promise<{
    version: number;
    exportedAt: string;
    data: {
      markupRules: MarkupRule[];
      bookings: BookingRecord[];
      analytics: AnalyticsRecord[];
      settings: Record<string, any>;
    };
  }> {
    const [markupRules, bookings, analytics, settingsData] = await Promise.all([
      this.getMarkupRules(),
      this.getBookings(),
      this.getAnalytics(),
      this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS),
    ]);

    const settings = settingsData || {};

    return {
      version: DATABASE_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        markupRules,
        bookings,
        analytics,
        settings,
      },
    };
  }

  // Import data from backup
  static async importData(exportData: {
    version: number;
    data: {
      markupRules?: MarkupRule[];
      bookings?: BookingRecord[];
      analytics?: AnalyticsRecord[];
      settings?: Record<string, any>;
    };
  }): Promise<void> {
    try {
      const { data } = exportData;
      
      if (data.markupRules) {
        await this.setItem(STORAGE_KEYS.MARKUP_RULES, data.markupRules);
      }
      
      if (data.bookings) {
        await this.setItem(STORAGE_KEYS.BOOKINGS, data.bookings);
      }
      
      if (data.analytics) {
        await this.setItem(STORAGE_KEYS.ANALYTICS, data.analytics);
      }
      
      if (data.settings) {
        await this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }
      
      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Data import failed:', error);
      throw new DatabaseError('Data import failed');
    }
  }
}

export default DatabaseService; 