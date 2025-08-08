import AsyncStorage from '@react-native-async-storage/async-storage';
import { HotelInquiryFormData } from './validation';

const DRAFT_KEY = 'draft.hotelInquiry.v1';

export const draftStorage = {
  // Save draft form data
  saveDraft: async (data: Partial<HotelInquiryFormData>) => {
    try {
      const draftData = {
        ...data,
        lastSaved: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  },

  // Load draft form data
  loadDraft: async (): Promise<Partial<HotelInquiryFormData> | null> => {
    try {
      const stored = await AsyncStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Remove lastSaved from the data
        const { lastSaved, ...draftData } = parsed;
        console.log('Draft loaded successfully, last saved:', lastSaved);
        return draftData;
      }
      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  },

  // Clear draft after successful submission
  clearDraft: async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      console.log('Draft cleared successfully');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  },

  // Check if draft exists
  hasDraft: async (): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(DRAFT_KEY);
      return stored !== null;
    } catch (error) {
      console.error('Error checking for draft:', error);
      return false;
    }
  },

  // Get draft age (for cleanup purposes)
  getDraftAge: async (): Promise<number | null> => {
    try {
      const stored = await AsyncStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lastSaved) {
          const lastSaved = new Date(parsed.lastSaved);
          const now = new Date();
          return now.getTime() - lastSaved.getTime();
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting draft age:', error);
      return null;
    }
  },
};

// Debounced save function
let saveTimeout: NodeJS.Timeout | null = null;

export const debouncedSaveDraft = (data: Partial<HotelInquiryFormData>) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    draftStorage.saveDraft(data);
  }, 2000); // Save after 2 seconds of inactivity
};

export default draftStorage; 