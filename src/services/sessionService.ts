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
import { DemoSession, SessionStatus } from '../types';

const COLLECTION_NAME = 'demoSessions';

export const sessionService = {
  async getSessionByClientId(clientId: string): Promise<DemoSession | null> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as DemoSession;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  subscribeSession(clientId: string, callback: (session: DemoSession | null) => void): () => void {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as DemoSession);
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${clientId}`);
      }
    );
  },

  subscribeAllSessions(callback: (sessions: DemoSession[]) => void): () => void {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        callback(snapshot.docs.map(d => d.data() as DemoSession));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );
  },

  async initSessionForClient(
    clientId: string, 
    clientEmail: string, 
    clientName: string, 
    durationMinutes: number
  ): Promise<DemoSession> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return existing.data() as DemoSession;
    }
    const newSession: DemoSession = {
      sessionId: `sess_${clientId}_${Date.now()}`,
      clientId,
      clientEmail,
      clientName,
      status: 'idle',
      durationMinutes,
      lastHeartbeat: Date.now()
    };
    try {
      await setDoc(docRef, newSession);
      return newSession;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async activateSession(clientId: string, currentProductId?: string, currentProductTitle?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      
      const now = Date.now();
      const expiresAt = now + (session.durationMinutes * 60 * 1000);
      
      await updateDoc(docRef, {
        status: 'active',
        startedAt: now,
        expiresAt: expiresAt,
        lastHeartbeat: now,
        ...(currentProductId ? { currentProductId, currentProductTitle } : {})
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async updateHeartbeat(clientId: string, currentProductId?: string, currentProductTitle?: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      await updateDoc(docRef, {
        lastHeartbeat: Date.now(),
        ...(currentProductId ? { currentProductId, currentProductTitle } : {})
      });
    } catch {
      // heartbeat best-effort
    }
  },

  async heartbeat(clientId: string): Promise<void> {
    return this.updateHeartbeat(clientId);
  },

  async extendSessionTime(clientId: string, additionalMinutes: number): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;

      const now = Date.now();
      let newExpiresAt: number;
      if (session.status === 'expired' || !session.expiresAt || session.expiresAt < now) {
        newExpiresAt = now + (additionalMinutes * 60 * 1000);
      } else {
        newExpiresAt = session.expiresAt + (additionalMinutes * 60 * 1000);
      }

      await updateDoc(docRef, {
        status: 'active',
        expiresAt: newExpiresAt,
        durationMinutes: (session.durationMinutes || 15) + additionalMinutes,
        pauseRemainingMs: null,
        lastHeartbeat: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async setRemainingTime(clientId: string, minutes: number): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const now = Date.now();
      const expiresAt = now + (Math.max(1, minutes) * 60 * 1000);
      await updateDoc(docRef, {
        status: 'active',
        startedAt: now,
        expiresAt,
        durationMinutes: Math.max(1, minutes),
        pauseRemainingMs: null,
        lastHeartbeat: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async pauseSession(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      if (session.status !== 'active') return;
      const remainingSec = this.calculateRemainingSeconds(session);
      await updateDoc(docRef, {
        status: 'paused',
        pauseRemainingMs: Math.max(0, remainingSec * 1000),
        lastHeartbeat: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async resumeSession(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      if (session.status !== 'paused') return;
      const pauseRemainingMs = session.pauseRemainingMs || (session.durationMinutes * 60 * 1000);
      const newExpiresAt = Date.now() + Math.max(5000, pauseRemainingMs);
      await updateDoc(docRef, {
        status: 'active',
        expiresAt: newExpiresAt,
        pauseRemainingMs: null,
        lastHeartbeat: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async updateSessionDuration(clientId: string, newDurationMinutes: number): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;

      if (session.status === 'idle') {
        await updateDoc(docRef, {
          durationMinutes: newDurationMinutes,
          lastHeartbeat: Date.now()
        });
      } else if (session.status === 'active' && session.expiresAt) {
        const diffMinutes = newDurationMinutes - (session.durationMinutes || 15);
        const newExpiresAt = session.expiresAt + (diffMinutes * 60 * 1000);
        await updateDoc(docRef, {
          durationMinutes: newDurationMinutes,
          expiresAt: Math.max(Date.now() + 10000, newExpiresAt),
          lastHeartbeat: Date.now()
        });
      } else {
        await updateDoc(docRef, {
          durationMinutes: newDurationMinutes,
          lastHeartbeat: Date.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async resetSession(clientId: string, newDurationMinutes?: number): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      const duration = newDurationMinutes || session.durationMinutes || 15;

      await updateDoc(docRef, {
        status: 'idle',
        durationMinutes: duration,
        startedAt: null,
        expiresAt: null,
        pauseRemainingMs: null,
        currentProductId: null,
        currentProductTitle: null,
        lastHeartbeat: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async revokeSession(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      await updateDoc(docRef, {
        status: 'revoked',
        lastHeartbeat: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async markExpired(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      await updateDoc(docRef, {
        status: 'expired',
        lastHeartbeat: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async deleteSession(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  // Calculate remaining time in seconds based on authoritative server timestamp
  calculateRemainingSeconds(session: DemoSession | null): number {
    if (!session) return 0;
    if (session.status === 'idle') {
      return (session.durationMinutes || 15) * 60;
    }
    if (session.status === 'paused') {
      return Math.max(0, Math.floor((session.pauseRemainingMs || ((session.durationMinutes || 15) * 60 * 1000)) / 1000));
    }
    if (session.status === 'expired' || session.status === 'revoked') {
      return 0;
    }
    if (!session.expiresAt) {
      return (session.durationMinutes || 15) * 60;
    }
    const remainingMs = session.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
};
