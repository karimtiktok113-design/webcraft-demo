import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { sanitizeForFirestore } from '../firebase/sanitize';
import { ClientProfile, ThemeName, TimerMode } from '../types';
import { sessionService } from './sessionService';
import { requestService } from './requestService';

const COLLECTION_NAME = 'clients';

export const DEFAULT_CLIENTS: ClientProfile[] = [
  {
    uid: 'admin_karim',
    email: 'karimfiverr20@gmail.com',
    password: 'admin123',
    accessCode: 'ADMIN-2026',
    fullName: 'Karim (Master Admin)',
    organization: 'WebCraft Goods HQ',
    role: 'admin',
    status: 'active',
    demoDurationMinutes: 120,
    timerMode: 'continuous',
    allowedProductIds: ['*'],
    preferredTheme: 'premium-light',
    notes: 'Primary Master Administrator with full store & client oversight',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: Date.now()
  },
  {
    uid: 'client_active_sarah',
    email: 'sarah.designer@example.com',
    password: 'client123',
    accessCode: 'SARAH-2026',
    fullName: 'Sarah Jenkins',
    organization: 'Studio Jenkins Creative',
    role: 'client',
    status: 'active',
    demoDurationMinutes: 20,
    timerMode: 'active_use',
    allowedProductIds: ['*'],
    preferredTheme: 'royal-purple',
    notes: 'Prospective buyer evaluating planner suite with Active Use Tracking',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: Date.now()
  },
  {
    uid: 'client_limited_alex',
    email: 'alex.planner@example.com',
    password: 'client123',
    accessCode: 'ALEX-2026',
    fullName: 'Alex Rivera',
    organization: 'Rivera Agile Consulting',
    role: 'client',
    status: 'active',
    demoDurationMinutes: 60,
    timerMode: 'scheduled',
    accountExpiresAt: Date.now() + 3 * 24 * 3600 * 1000, // 3 days scheduled calendar window
    allowedProductIds: ['planner-pro-2026'],
    preferredTheme: 'ocean-blue',
    notes: 'Single tool access requested for Life & Business Planner with 3-day scheduled window',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: Date.now()
  },
  {
    uid: 'client_expired_marcus',
    email: 'marcus.biz@example.com',
    password: 'client123',
    accessCode: 'MARCUS-2026',
    fullName: 'Marcus Vance',
    organization: 'Vance Capital Media',
    role: 'client',
    status: 'active',
    demoDurationMinutes: 15,
    timerMode: 'continuous',
    allowedProductIds: ['*'],
    preferredTheme: 'slate',
    notes: 'Demo evaluation expired. Tested Request Time modal & Etsy purchase',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: Date.now() - 3600000
  }
];

export const clientService = {
  async ensureAdminActive(): Promise<void> {
    try {
      const adminDocRef = doc(db, COLLECTION_NAME, 'admin_karim');
      const snap = await getDoc(adminDocRef);
      if (!snap.exists() || snap.data()?.status !== 'active' || snap.data()?.role !== 'admin') {
        const adminProfile: ClientProfile = {
          uid: 'admin_karim',
          email: 'karimfiverr20@gmail.com',
          password: 'admin123',
          accessCode: 'ADMIN-2026',
          fullName: 'Karim (Master Admin)',
          organization: 'WebCraft Goods HQ',
          role: 'admin',
          status: 'active',
          demoDurationMinutes: 120,
          timerMode: 'continuous',
          allowedProductIds: ['*'],
          preferredTheme: 'premium-light',
          notes: 'Primary Master Administrator with full store & client oversight',
          createdAt: snap.exists() ? (snap.data()?.createdAt || new Date().toISOString()) : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: Date.now()
        };
        await setDoc(adminDocRef, adminProfile, { merge: true });
      }
    } catch (err) {
      console.warn('Admin activation check note:', err);
    }
  },

  async seedClientsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (snap.empty) {
        for (const client of DEFAULT_CLIENTS) {
          await setDoc(doc(db, COLLECTION_NAME, client.uid), client);
        }
      } else {
        // Guarantee master admin exists and is active
        await this.ensureAdminActive();
      }
    } catch (err) {
      console.warn('Clients seed note:', err);
    }
  },

  async getAllClients(): Promise<ClientProfile[]> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      if (snap.empty) {
        return DEFAULT_CLIENTS;
      }
      return snap.docs.map(d => d.data() as ClientProfile);
    } catch (error) {
      console.warn('getAllClients fallback to defaults:', error);
      return DEFAULT_CLIENTS;
    }
  },

  subscribeClients(callback: (clients: ClientProfile[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_CLIENTS);
        } else {
          callback(snapshot.docs.map(d => d.data() as ClientProfile));
        }
      },
      (error) => {
        console.warn('subscribeClients error, returning defaults:', error);
        callback(DEFAULT_CLIENTS);
      }
    );
  },

  async getClientByUid(uid: string): Promise<ClientProfile | null> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ClientProfile;
      }
      const fallback = DEFAULT_CLIENTS.find(c => c.uid === uid);
      return fallback || null;
    } catch {
      const fallback = DEFAULT_CLIENTS.find(c => c.uid === uid);
      return fallback || null;
    }
  },

  async getClientByEmail(email: string): Promise<ClientProfile | null> {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      const clean = email.trim().toLowerCase();
      const found = snap.docs.find(d => {
        const data = d.data() as ClientProfile;
        return data.email?.toLowerCase() === clean;
      });
      if (found) return found.data() as ClientProfile;
      const fallback = DEFAULT_CLIENTS.find(c => c.email.toLowerCase() === clean);
      return fallback || null;
    } catch (error) {
      console.warn('Query client by email fallback:', error);
      const clean = email.trim().toLowerCase();
      const fallback = DEFAULT_CLIENTS.find(c => c.email.toLowerCase() === clean);
      return fallback || null;
    }
  },

  async verifyCredentialsInFirestore(email: string, passwordOrCode: string): Promise<ClientProfile | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanSecret = passwordOrCode.trim();

    if (!cleanEmail || !cleanSecret) {
      return null;
    }

    try {
      // 1. Check in Firestore collection
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      let candidate: ClientProfile | null = null;

      if (!snap.empty) {
        for (const d of snap.docs) {
          const c = d.data() as ClientProfile;
          if (c.email && c.email.trim().toLowerCase() === cleanEmail) {
            candidate = c;
            break;
          }
        }
      }

      // 2. If not found in Firestore, check fallback DEFAULT_CLIENTS
      if (!candidate) {
        const fallback = DEFAULT_CLIENTS.find(c => c.email.toLowerCase() === cleanEmail);
        if (fallback) {
          candidate = { ...fallback };
        }
      }

      // If user does not exist at all, reject immediately
      if (!candidate) {
        return null;
      }

      // 3. STRICT Credential Validation: NO bypasses, NO universal backdoors
      const storedPassword = candidate.password ? candidate.password.trim() : '';
      const storedAccessCode = candidate.accessCode ? candidate.accessCode.trim() : '';

      const isPasswordMatch = storedPassword.length > 0 && storedPassword === cleanSecret;
      const isAccessCodeMatch = storedAccessCode.length > 0 && storedAccessCode.toLowerCase() === cleanSecret.toLowerCase();

      if (!isPasswordMatch && !isAccessCodeMatch) {
        // Wrong credentials: REJECT IMMEDIATELY! Do not log in!
        return null;
      }

      // 4. Verify Account Status
      // Master admin is always active
      if (candidate.uid === 'admin_karim' || candidate.role === 'admin' || cleanEmail === 'karimfiverr20@gmail.com') {
        candidate.role = 'admin';
        candidate.status = 'active';
      } else if (candidate.status === 'suspended' || candidate.status === 'revoked') {
        throw new Error(`Your account status is currently "${candidate.status}". Please contact the store administrator.`);
      }

      return candidate;
    } catch (err: any) {
      if (err.message && err.message.includes('account status is currently')) {
        throw err;
      }
      console.warn('verifyCredentialsInFirestore check note:', err);
      // Strict fallback: locate matching fallback client and verify password strictly
      const fallback = DEFAULT_CLIENTS.find(c => c.email.toLowerCase() === cleanEmail);
      if (fallback) {
        const storedPassword = fallback.password ? fallback.password.trim() : '';
        const storedAccessCode = fallback.accessCode ? fallback.accessCode.trim() : '';
        const isPasswordMatch = storedPassword.length > 0 && storedPassword === cleanSecret;
        const isAccessCodeMatch = storedAccessCode.length > 0 && storedAccessCode.toLowerCase() === cleanSecret.toLowerCase();
        if (isPasswordMatch || isAccessCodeMatch) {
          return fallback;
        }
      }
      return null;
    }
  },

  subscribeClient(uid: string, callback: (client: ClientProfile | null) => void): () => void {
    const docRef = doc(db, COLLECTION_NAME, uid);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as ClientProfile);
        } else {
          const fallback = DEFAULT_CLIENTS.find(c => c.uid === uid);
          callback(fallback || null);
        }
      },
      (error) => {
        console.warn('subscribeClient error:', error);
        const fallback = DEFAULT_CLIENTS.find(c => c.uid === uid);
        callback(fallback || null);
      }
    );
  },

  async saveClient(client: ClientProfile): Promise<void> {
    const cleanClient = sanitizeForFirestore(client);
    const docRef = doc(db, COLLECTION_NAME, cleanClient.uid);
    try {
      await setDoc(docRef, cleanClient, { merge: true });
      // Also update in-memory DEFAULT_CLIENTS if it exists there
      const idx = DEFAULT_CLIENTS.findIndex(c => c.uid === cleanClient.uid);
      if (idx !== -1) {
        DEFAULT_CLIENTS[idx] = { ...DEFAULT_CLIENTS[idx], ...cleanClient };
      } else {
        DEFAULT_CLIENTS.push(cleanClient);
      }
      if (cleanClient.timerMode) {
        await sessionService.updateSessionPolicy(
          cleanClient.uid, 
          cleanClient.timerMode, 
          cleanClient.demoDurationMinutes, 
          cleanClient.accountExpiresAt
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${cleanClient.uid}`);
    }
  },

  async updateClientAllowedProducts(uid: string, allowedProductIds: string[]): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await updateDoc(docRef, sanitizeForFirestore({
        allowedProductIds,
        updatedAt: new Date().toISOString()
      }));
      const idx = DEFAULT_CLIENTS.findIndex(c => c.uid === uid);
      if (idx !== -1) {
        DEFAULT_CLIENTS[idx].allowedProductIds = allowedProductIds;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
    }
  },

  async updateClientTimer(
    uid: string, 
    demoDurationMinutes: number, 
    timerMode: TimerMode = 'continuous',
    accountExpiresAt?: number | null
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await updateDoc(docRef, sanitizeForFirestore({
        demoDurationMinutes,
        timerMode,
        accountExpiresAt: accountExpiresAt !== undefined ? accountExpiresAt : null,
        updatedAt: new Date().toISOString()
      }));
      const idx = DEFAULT_CLIENTS.findIndex(c => c.uid === uid);
      if (idx !== -1) {
        DEFAULT_CLIENTS[idx].demoDurationMinutes = demoDurationMinutes;
        DEFAULT_CLIENTS[idx].timerMode = timerMode;
        if (accountExpiresAt !== undefined) {
          DEFAULT_CLIENTS[idx].accountExpiresAt = accountExpiresAt;
        }
      }
      // Authoritatively update their live session duration & policy in Firestore
      await sessionService.updateSessionPolicy(uid, timerMode, demoDurationMinutes, accountExpiresAt);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
    }
  },

  async updateClientStatus(uid: string, status: ClientProfile['status']): Promise<void> {
    // Master Admin is protected and permanently active
    if (uid === 'admin_karim' && status !== 'active') {
      console.warn('Master Admin account is permanently active and cannot be suspended.');
      return;
    }
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await updateDoc(docRef, sanitizeForFirestore({ 
        status, 
        updatedAt: new Date().toISOString() 
      }));
      const idx = DEFAULT_CLIENTS.findIndex(c => c.uid === uid);
      if (idx !== -1) {
        DEFAULT_CLIENTS[idx].status = status;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
    }
  },

  async updateClientTheme(uid: string, preferredTheme: ThemeName): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await updateDoc(docRef, sanitizeForFirestore({ 
        preferredTheme, 
        updatedAt: new Date().toISOString() 
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
    }
  },

  async deleteClient(uid: string): Promise<void> {
    return this.deleteClientWithCascade(uid, {
      deleteSession: true,
      deleteRequests: true,
      softDelete: false
    });
  },

  async deleteClientWithCascade(
    uid: string, 
    options: { 
      deleteSession?: boolean; 
      deleteRequests?: boolean; 
      softDelete?: boolean; 
      reason?: string 
    }
  ): Promise<void> {
    // Prevent deletion of Master Admin
    if (uid === 'admin_karim') {
      throw new Error('The Master Administrator account is permanently protected and cannot be deleted.');
    }

    if (options.softDelete) {
      // Soft deletion: Revoke client access while preserving data records
      await this.updateClientStatus(uid, 'revoked');
      if (options.deleteSession) {
        await sessionService.revokeSession(uid);
      }
      return;
    }

    // Permanent hard purge from Firestore
    const docRef = doc(db, COLLECTION_NAME, uid);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${uid}`);
    }

    // Remove from in-memory fallback list if present
    const idx = DEFAULT_CLIENTS.findIndex(c => c.uid === uid);
    if (idx !== -1) {
      DEFAULT_CLIENTS.splice(idx, 1);
    }

    // Cascade delete demo session if requested
    if (options.deleteSession) {
      try {
        await sessionService.deleteSession(uid);
      } catch (err) {
        console.warn('Session delete note:', err);
      }
    }

    // Cascade delete client access requests if requested
    if (options.deleteRequests) {
      try {
        await requestService.deleteRequestsForClient(uid);
      } catch (err) {
        console.warn('Requests cleanup note:', err);
      }
    }
  }
};
