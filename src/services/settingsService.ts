import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { AdminSettings } from '../types';

import { sanitizeForFirestore } from '../firebase/sanitize';

const DOC_PATH = 'adminSettings/global';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  id: 'global',
  siteName: 'WebCraft Goods',
  tagline: 'Premium Interactive Digital Tools & Planners',
  defaultDemoDurationMinutes: 15,
  defaultTheme: 'premium-light',
  timerWarningThresholds: [10, 5, 1],
  supportEmail: 'support@webcraftgoods.com',
  etsyStoreUrl: 'https://www.etsy.com',
  allowClientThemeChange: true,
  requireActivationClick: true
};

export const settingsService = {
  async getSettings(): Promise<AdminSettings> {
    const docRef = doc(db, 'adminSettings', 'global');
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as AdminSettings;
      }
      return DEFAULT_ADMIN_SETTINGS;
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  },

  subscribeSettings(callback: (settings: AdminSettings) => void): () => void {
    const docRef = doc(db, 'adminSettings', 'global');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as AdminSettings);
        } else {
          callback(DEFAULT_ADMIN_SETTINGS);
        }
      },
      () => {
        callback(DEFAULT_ADMIN_SETTINGS);
      }
    );
  },

  async updateSettings(settings: Partial<AdminSettings>): Promise<void> {
    const docRef = doc(db, 'adminSettings', 'global');
    try {
      const cleanSettings = sanitizeForFirestore(settings);
      await setDoc(docRef, cleanSettings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, DOC_PATH);
    }
  }
};
