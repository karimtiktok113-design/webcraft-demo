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
import { DemoSession, SessionStatus, TimerMode, ClientProfile } from '../types';

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
    durationMinutes: number,
    timerMode: TimerMode = 'continuous',
    scheduledExpiresAt?: number | null
  ): Promise<DemoSession> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const existingData = existing.data() as DemoSession;
      // If timer mode, duration, or schedule changed, synchronize it immediately
      const modeChanged = timerMode && existingData.timerMode !== timerMode;
      const scheduleChanged = scheduledExpiresAt !== undefined && existingData.scheduledExpiresAt !== scheduledExpiresAt;
      
      if (modeChanged || scheduleChanged) {
        const updates: Partial<DemoSession> & Record<string, any> = {
          timerMode: timerMode || 'continuous',
          scheduledExpiresAt: scheduledExpiresAt || null
        };
        if (timerMode === 'scheduled' && scheduledExpiresAt) {
          updates.expiresAt = scheduledExpiresAt;
        } else if (timerMode === 'active_use' && !existingData.pauseRemainingMs) {
          updates.pauseRemainingMs = (existingData.durationMinutes || durationMinutes || 15) * 60 * 1000;
        }
        await updateDoc(docRef, updates);
        return { ...existingData, ...updates } as DemoSession;
      }
      return existingData;
    }

    const newSession: DemoSession = {
      sessionId: `sess_${clientId}_${Date.now()}`,
      clientId,
      clientEmail,
      clientName,
      status: 'idle',
      durationMinutes,
      timerMode: timerMode || 'continuous',
      scheduledExpiresAt: scheduledExpiresAt || null,
      lastHeartbeat: Date.now(),
      lastActiveAt: Date.now(),
      isAutoPaused: false,
      isDemoOpen: false,
      pauseRemainingMs: durationMinutes * 60 * 1000,
      ...(timerMode === 'scheduled' && scheduledExpiresAt ? { expiresAt: scheduledExpiresAt } : {})
    };

    try {
      const cleanSession = sanitizeForFirestore(newSession);
      await setDoc(docRef, cleanSession);
      return cleanSession;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async activateSession(
    clientId: string, 
    currentProductId?: string, 
    currentProductTitle?: string,
    timerMode?: TimerMode,
    scheduledExpiresAt?: number | null,
    durationMinutes?: number
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      
      const now = Date.now();
      const mode = timerMode || session.timerMode || 'continuous';
      const effectiveDuration = (durationMinutes && durationMinutes > 0)
        ? durationMinutes
        : (session.durationMinutes || 15);
      const scheduledTarget = scheduledExpiresAt !== undefined ? scheduledExpiresAt : (session.scheduledExpiresAt || null);

      let expiresAt: number;
      let pauseRemainingMs: number | null = null;

      if (mode === 'scheduled') {
        expiresAt = scheduledTarget || (now + (effectiveDuration * 60 * 1000));
      } else if (mode === 'active_use') {
        // Resume from previous remaining time or start fresh baseline
        const remainingActiveMs = (session.pauseRemainingMs !== undefined && session.pauseRemainingMs !== null && session.pauseRemainingMs > 0)
          ? session.pauseRemainingMs
          : (effectiveDuration * 60 * 1000);
        expiresAt = now + remainingActiveMs;
        pauseRemainingMs = remainingActiveMs;
      } else {
        expiresAt = now + (effectiveDuration * 60 * 1000);
      }
      
      const updates = {
        status: 'active' as SessionStatus,
        durationMinutes: effectiveDuration,
        startedAt: session.startedAt || now,
        expiresAt: expiresAt,
        timerMode: mode,
        scheduledExpiresAt: scheduledTarget,
        lastHeartbeat: now,
        lastActiveAt: now,
        isAutoPaused: false,
        isDemoOpen: true,
        pauseRemainingMs: pauseRemainingMs,
        currentProductId: currentProductId || null,
        currentProductTitle: currentProductTitle || null
      };

      await updateDoc(docRef, sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async updateHeartbeat(clientId: string, currentProductId?: string, currentProductTitle?: string, isDemoOpen?: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const updates: Record<string, any> = {
        lastHeartbeat: Date.now(),
        lastActiveAt: Date.now()
      };
      if (currentProductId) {
        updates.currentProductId = currentProductId;
        updates.currentProductTitle = currentProductTitle || null;
      }
      if (isDemoOpen !== undefined) {
        updates.isDemoOpen = isDemoOpen;
      }
      await updateDoc(docRef, updates);
    } catch {
      // heartbeat best-effort
    }
  },

  async heartbeat(clientId: string): Promise<void> {
    return this.updateHeartbeat(clientId);
  },

  // Active Use Tracking: auto-pause session when user is inactive or switches tab
  async autoPauseSession(clientId: string, clientProfile?: ClientProfile | null): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      if (session.status !== 'active' || session.isAutoPaused) return;

      const remainingSec = this.calculateRemainingSeconds(session, clientProfile, false);
      const remainingMs = Math.max(0, remainingSec * 1000);

      await updateDoc(docRef, {
        isAutoPaused: true,
        pauseRemainingMs: remainingMs,
        lastHeartbeat: Date.now()
      });
    } catch {
      // best-effort
    }
  },

  // Active Use Tracking: auto-resume session when user resumes activity inside demo
  async autoResumeSession(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      if (session.status === 'expired' || session.status === 'revoked') return;
      if (session.status !== 'active' && session.status !== 'paused' && !session.isAutoPaused) return;

      const remainingMs = (session.pauseRemainingMs !== undefined && session.pauseRemainingMs !== null && session.pauseRemainingMs > 0)
        ? session.pauseRemainingMs 
        : (session.durationMinutes * 60 * 1000);
      const newExpiresAt = Date.now() + Math.max(1000, remainingMs);

      await updateDoc(docRef, {
        status: 'active',
        isAutoPaused: false,
        isDemoOpen: true,
        expiresAt: newExpiresAt,
        pauseRemainingMs: remainingMs,
        lastHeartbeat: Date.now(),
        lastActiveAt: Date.now()
      });
    } catch {
      // best-effort
    }
  },

  // Update session policy directly from Admin
  async updateSessionPolicy(
    clientId: string,
    timerMode: TimerMode,
    durationMinutes?: number,
    scheduledExpiresAt?: number | null
  ): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;

      const updates: Partial<DemoSession> & Record<string, any> = {
        timerMode,
        scheduledExpiresAt: scheduledExpiresAt || null,
        lastHeartbeat: Date.now()
      };

      if (durationMinutes !== undefined && durationMinutes > 0) {
        updates.durationMinutes = durationMinutes;
      }

      const effectiveDuration = durationMinutes || session.durationMinutes || 15;

      if (timerMode === 'scheduled') {
        if (scheduledExpiresAt) {
          updates.expiresAt = scheduledExpiresAt;
        } else if (!session.expiresAt) {
          updates.expiresAt = Date.now() + (effectiveDuration * 60 * 1000);
        }
      } else if (timerMode === 'active_use') {
        const remainingSec = this.calculateRemainingSeconds(session, null, false);
        updates.pauseRemainingMs = remainingSec * 1000;
        updates.expiresAt = Date.now() + (remainingSec * 1000);
      } else if (timerMode === 'continuous') {
        if (session.isAutoPaused || session.status === 'paused') {
          const remainingSec = this.calculateRemainingSeconds(session, null, true);
          updates.isAutoPaused = false;
          updates.status = 'active';
          updates.expiresAt = Date.now() + (remainingSec * 1000);
        }
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async extendSessionTime(clientId: string, additionalMinutes: number): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;

      const now = Date.now();
      const additionalMs = additionalMinutes * 60 * 1000;

      if (session.timerMode === 'scheduled' && session.scheduledExpiresAt) {
        const newExpiresAt = Math.max(now, session.scheduledExpiresAt) + additionalMs;
        await updateDoc(docRef, {
          status: 'active',
          scheduledExpiresAt: newExpiresAt,
          expiresAt: newExpiresAt,
          durationMinutes: (session.durationMinutes || 15) + additionalMinutes,
          pauseRemainingMs: null,
          lastHeartbeat: now
        });
        return;
      }

      if (session.timerMode === 'active_use') {
        const currentRemaining = (session.pauseRemainingMs !== undefined && session.pauseRemainingMs !== null)
          ? session.pauseRemainingMs 
          : (this.calculateRemainingSeconds(session, null, false) * 1000);
        const newRemainingMs = Math.max(0, currentRemaining) + additionalMs;
        await updateDoc(docRef, {
          expiresAt: now + newRemainingMs,
          pauseRemainingMs: newRemainingMs,
          durationMinutes: (session.durationMinutes || 15) + additionalMinutes,
          lastHeartbeat: now
        });
        return;
      }

      let newExpiresAt: number;
      if (session.status === 'expired' || !session.expiresAt || session.expiresAt < now) {
        newExpiresAt = now + additionalMs;
      } else {
        newExpiresAt = session.expiresAt + additionalMs;
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
      const session = snap.data() as DemoSession;
      const now = Date.now();
      const expiresAt = now + (Math.max(1, minutes) * 60 * 1000);

      const updates: Partial<DemoSession> & Record<string, any> = {
        startedAt: session.startedAt || now,
        expiresAt,
        durationMinutes: Math.max(1, minutes),
        pauseRemainingMs: Math.max(1, minutes) * 60 * 1000,
        lastHeartbeat: now
      };

      if (session.timerMode === 'scheduled') {
        updates.scheduledExpiresAt = expiresAt;
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  // Authoritatively pause session when client closes the demo or clicks pause
  async pauseSession(clientId: string, clientProfile?: ClientProfile | null): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const session = snap.data() as DemoSession;
      if (session.status !== 'active') return;

      let remainingMs = (session.durationMinutes || 15) * 60 * 1000;
      if (session.expiresAt && session.expiresAt > Date.now()) {
        remainingMs = Math.max(0, session.expiresAt - Date.now());
      } else if (session.pauseRemainingMs !== undefined && session.pauseRemainingMs !== null) {
        remainingMs = session.pauseRemainingMs;
      }

      await updateDoc(docRef, {
        status: 'paused',
        isAutoPaused: false,
        isDemoOpen: false,
        pauseRemainingMs: remainingMs,
        expiresAt: Date.now() + remainingMs,
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
      if (session.status !== 'paused' && !session.isAutoPaused) return;
      const pauseRemainingMs = session.pauseRemainingMs || (session.durationMinutes * 60 * 1000);
      const newExpiresAt = Date.now() + Math.max(5000, pauseRemainingMs);
      await updateDoc(docRef, {
        status: 'active',
        isAutoPaused: false,
        isDemoOpen: true,
        expiresAt: newExpiresAt,
        pauseRemainingMs: session.timerMode === 'active_use' ? pauseRemainingMs : null,
        lastHeartbeat: Date.now(),
        lastActiveAt: Date.now()
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
          pauseRemainingMs: newDurationMinutes * 60 * 1000,
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

  async resetSession(clientId: string, durationMinutes: number = 15, timerMode: TimerMode = 'continuous', scheduledExpiresAt?: number | null): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      const now = Date.now();
      const updates: Record<string, any> = {
        status: 'idle' as SessionStatus,
        durationMinutes,
        timerMode,
        scheduledExpiresAt: scheduledExpiresAt || null,
        startedAt: null,
        expiresAt: timerMode === 'scheduled' && scheduledExpiresAt ? scheduledExpiresAt : null,
        currentProductId: null,
        currentProductTitle: null,
        isAutoPaused: false,
        isDemoOpen: false,
        pauseRemainingMs: durationMinutes * 60 * 1000,
        lastHeartbeat: now,
        lastActiveAt: now
      };
      await updateDoc(docRef, sanitizeForFirestore(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${clientId}`);
    }
  },

  async markExpired(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    try {
      await updateDoc(docRef, {
        status: 'expired',
        isAutoPaused: false,
        isDemoOpen: false,
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
        isAutoPaused: false,
        isDemoOpen: false,
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

  // Calculate remaining time in seconds based on authoritative server timestamp & policy
  calculateRemainingSeconds(
    session: DemoSession | null, 
    clientProfile?: ClientProfile | null,
    isDemoOpen?: boolean
  ): number {
    const baseDurationMinutes = clientProfile?.demoDurationMinutes || session?.durationMinutes || 15;

    if (!session) {
      if (clientProfile && clientProfile.role === 'client') {
        const mode = clientProfile.timerMode || 'continuous';
        if (mode === 'scheduled' && clientProfile.accountExpiresAt) {
          return Math.max(0, Math.floor((clientProfile.accountExpiresAt - Date.now()) / 1000));
        }
        return baseDurationMinutes * 60;
      }
      return 0;
    }

    if (session.status === 'expired' || session.status === 'revoked') {
      return 0;
    }

    // Client profile policy takes authoritative priority if configured, otherwise session policy
    const effectiveMode = clientProfile?.timerMode || session.timerMode || 'continuous';

    // 1. SCHEDULED EXPIRY MODE
    if (effectiveMode === 'scheduled') {
      const targetTime = session.scheduledExpiresAt || clientProfile?.accountExpiresAt || session.expiresAt;
      if (!targetTime) {
        return baseDurationMinutes * 60;
      }
      const diffMs = targetTime - Date.now();
      return Math.max(0, Math.floor(diffMs / 1000));
    }

    // 2. ACTIVE USE TRACKING MODE
    if (effectiveMode === 'active_use') {
      if (session.status === 'idle') {
        return baseDurationMinutes * 60;
      }
      
      // Determine if demo is currently open:
      const isActuallyOpen = isDemoOpen !== undefined ? isDemoOpen : Boolean(session.isDemoOpen);

      // In active_use mode: if demo is closed, session is paused, or auto-paused:
      // THE TIMER MUST BE 100% FROZEN!
      if (!isActuallyOpen || session.status === 'paused' || session.isAutoPaused) {
        let remainingMs: number;
        if (session.pauseRemainingMs !== undefined && session.pauseRemainingMs !== null && session.pauseRemainingMs >= 0) {
          remainingMs = session.pauseRemainingMs;
        } else if (session.expiresAt && session.expiresAt > Date.now()) {
          remainingMs = session.expiresAt - Date.now();
        } else {
          remainingMs = baseDurationMinutes * 60 * 1000;
        }
        return Math.max(0, Math.floor(remainingMs / 1000));
      }

      // If demo is actively running and tab is active:
      if (session.expiresAt) {
        const remainingMs = session.expiresAt - Date.now();
        return Math.max(0, Math.floor(remainingMs / 1000));
      }
      return baseDurationMinutes * 60;
    }

    // 3. CONTINUOUS COUNTDOWN MODE (default)
    if (session.status === 'idle') {
      return baseDurationMinutes * 60;
    }
    if (session.status === 'paused') {
      return Math.max(0, Math.floor((session.pauseRemainingMs || (baseDurationMinutes * 60 * 1000)) / 1000));
    }
    if (!session.expiresAt) {
      return baseDurationMinutes * 60;
    }
    const remainingMs = session.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
};
