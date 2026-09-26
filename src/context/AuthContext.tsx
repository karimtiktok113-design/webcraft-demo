import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut 
} from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';
import { clientService, DEFAULT_CLIENTS } from '../services/clientService';
import { sessionService } from '../services/sessionService';
import { logService } from '../services/logService';
import { ClientProfile, DemoSession, UserRole } from '../types';

export const ADMIN_EMAILS = [
  'karimfiverr20@gmail.com',
  'karimtiktok113@gmail.com',
  'admin@webcraftgoods.com'
];

export const isEmailAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(lower) || /^karim.*@gmail\.com$/.test(lower);
};

export const ADMIN_EMAIL = 'karimfiverr20@gmail.com';
const STORAGE_SESSION_KEY = 'wc_goods_client_session_v1';

interface AuthContextType {
  currentUser: User | null;
  clientProfile: ClientProfile | null;
  currentSession: DemoSession | null;
  isAdmin: boolean;
  isClient: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<ClientProfile>;
  quickLoginAs: (role: 'admin' | 'client_active' | 'client_limited' | 'client_expired') => Promise<void>;
  logout: () => Promise<void>;
  activateDemoSession: (productId?: string, productTitle?: string) => Promise<void>;
  resumeActiveUseSession: () => Promise<void>;
  pauseActiveSession: () => Promise<void>;
  isAutoPaused: boolean;
  isDemoOpen: boolean;
  setIsDemoOpen: (open: boolean) => void;
  remainingSeconds: number;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<DemoSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const isAutoPaused = Boolean(currentSession?.isAutoPaused);

  const isAdmin = Boolean(
    isEmailAdmin(currentUser?.email) ||
    clientProfile?.role === 'admin'
  );

  const isClient = Boolean(
    clientProfile?.role === 'client'
  );

  // Helper to build a pseudo User object for Firestore-authenticated clients
  const createClientUserObj = (profile: ClientProfile): User => {
    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.fullName,
      emailVerified: true,
      isAnonymous: false,
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'firestore-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User;
  };

  // Check connection to Firestore & seed initial clients
  useEffect(() => {
    testConnection();
    clientService.seedClientsIfEmpty().catch(() => {});
    clientService.ensureAdminActive().catch(() => {});
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!clientProfile) return;
    try {
      const profile = await clientService.getClientByUid(clientProfile.uid);
      if (profile) {
        setClientProfile(profile);
      }
    } catch (e) {
      console.warn('Failed refreshing profile:', e);
    }
  }, [clientProfile]);

  // Restore stored session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.uid) {
            const profile = await clientService.getClientByUid(parsed.uid);
            if (profile && (profile.status === 'active' || profile.role === 'admin' || isEmailAdmin(profile.email))) {
              // Ensure admin is active
              if (profile.role === 'admin' || isEmailAdmin(profile.email)) {
                profile.status = 'active';
              }
              setClientProfile(profile);
              setCurrentUser(createClientUserObj(profile));

              if (profile.role === 'client') {
                const sess = await sessionService.initSessionForClient(
                  profile.uid,
                  profile.email,
                  profile.fullName,
                  profile.demoDurationMinutes,
                  profile.timerMode,
                  profile.accountExpiresAt
                );
                setCurrentSession(sess);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error restoring session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const isUserAdmin = isEmailAdmin(user.email);
          let profile = await clientService.getClientByUid(user.uid);

          if (!profile) {
            profile = {
              uid: user.uid,
              email: user.email || '',
              fullName: user.displayName || (isUserAdmin ? 'Karim (Master Admin)' : 'Authorized Client'),
              role: isUserAdmin ? 'admin' : 'client',
              status: 'active',
              demoDurationMinutes: 15,
              timerMode: 'continuous',
              allowedProductIds: ['*'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: Date.now()
            };
            await clientService.saveClient(profile);
          } else {
            if (isUserAdmin && profile.role !== 'admin') {
              profile.role = 'admin';
            }
            await clientService.saveClient({
              ...profile,
              lastLoginAt: Date.now(),
              updatedAt: new Date().toISOString()
            });
          }

          setCurrentUser(user);
          setClientProfile(profile);
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ uid: profile.uid, email: profile.email }));

          if (profile.role === 'client') {
            const sess = await sessionService.initSessionForClient(
              profile.uid,
              profile.email,
              profile.fullName,
              profile.demoDurationMinutes,
              profile.timerMode,
              profile.accountExpiresAt
            );
            setCurrentSession(sess);
          }

          logService.recordLog(
            user.uid,
            user.email || 'unknown',
            profile.role,
            'login',
            `User logged in via Google Authentication`
          );
        } catch (err) {
          console.error('Error loading client profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for client's demo session and profile updates in Firestore
  useEffect(() => {
    if (!clientProfile || clientProfile.role !== 'client') return;
    const uid = clientProfile.uid;

    const unsubSession = sessionService.subscribeSession(uid, (sess) => {
      if (sess) {
        setCurrentSession(sess);
      }
    });

    const unsubClient = clientService.subscribeClient(uid, (updatedProfile) => {
      if (updatedProfile) {
        setClientProfile(prev => {
          if (!prev || prev.uid !== uid) return prev;
          return { ...prev, ...updatedProfile };
        });
      }
    });

    return () => {
      unsubSession();
      unsubClient();
    };
  }, [clientProfile?.uid]);

  // Real-time authoritative timer countdown interval
  useEffect(() => {
    const updateTimer = () => {
      if (!currentSession) {
        setRemainingSeconds(0);
        return;
      }

      const sec = sessionService.calculateRemainingSeconds(currentSession, clientProfile, isDemoOpen);
      setRemainingSeconds(sec);

      // Check if session just expired
      if (currentSession.status === 'active' && sec <= 0) {
        sessionService.markExpired(currentSession.clientId);
        logService.recordLog(
          currentSession.clientId,
          currentSession.clientEmail,
          'client',
          'timer_expired',
          'Client demo session reached 0 seconds'
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentSession, clientProfile, isDemoOpen]);

  // Active usage tracking for timerMode === 'active_use'
  useEffect(() => {
    const effectiveMode = currentSession?.timerMode || clientProfile?.timerMode;
    if (!isClient || !clientProfile || effectiveMode !== 'active_use') return;
    if (!currentSession) return;

    // CRITICAL: In active_use mode, timer MUST ONLY run when a demo is actively open!
    if (!isDemoOpen) {
      if (currentSession.status === 'active' && !currentSession.isAutoPaused) {
        sessionService.autoPauseSession(clientProfile.uid, clientProfile);
      }
      return;
    }

    if (currentSession.status !== 'active') return;

    let idleTimeout: NodeJS.Timeout | null = null;
    const IDLE_LIMIT_MS = 60000; // 60 seconds without input triggers auto-pause to save evaluation time

    const handleUserActive = () => {
      // Only resume if demo is open and session was auto-paused
      if (isDemoOpen && currentSession.isAutoPaused) {
        sessionService.autoResumeSession(clientProfile.uid);
      }
      
      // Reset idle timer
      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        // User has been idle for 60s inside demo -> auto-pause session to conserve evaluation allowance
        sessionService.autoPauseSession(clientProfile.uid, clientProfile);
      }, IDLE_LIMIT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away or minimized -> auto-pause immediately
        sessionService.autoPauseSession(clientProfile.uid, clientProfile);
      } else if (isDemoOpen) {
        // Tab restored to focus while demo is open -> resume active evaluation
        sessionService.autoResumeSession(clientProfile.uid);
        handleUserActive();
      }
    };

    const handleBeforeUnload = () => {
      // Save remaining time before closing or leaving page
      sessionService.autoPauseSession(clientProfile.uid, clientProfile);
    };

    // Initialize idle timer
    idleTimeout = setTimeout(() => {
      sessionService.autoPauseSession(clientProfile.uid, clientProfile);
    }, IDLE_LIMIT_MS);

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActive, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActive));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isClient, isDemoOpen, clientProfile?.uid, clientProfile?.timerMode, currentSession?.status, currentSession?.isAutoPaused, currentSession?.timerMode]);

  // Periodic heartbeat sync to Firestore while demo session is active
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'active') return;

    const heartbeatInterval = setInterval(() => {
      sessionService.updateHeartbeat(currentSession.clientId, undefined, undefined, isDemoOpen);
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [currentSession, isDemoOpen]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // Synchronized Firestore Client Login
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const client = await clientService.verifyCredentialsInFirestore(email, pass);

      if (!client) {
        throw new Error('Invalid email or password. Please verify your credentials or contact the administrator.');
      }

      // Master admin is always permanently active
      if (isEmailAdmin(client.email) || client.role === 'admin' || client.uid === 'admin_karim') {
        client.role = 'admin';
        client.status = 'active';
      } else if (client.status === 'suspended' || client.status === 'revoked') {
        throw new Error(`Your account status is currently ${client.status}. Please contact the administrator.`);
      }

      // Update last login in Firestore
      const updatedClient: ClientProfile = {
        ...client,
        lastLoginAt: Date.now(),
        updatedAt: new Date().toISOString()
      };
      await clientService.saveClient(updatedClient);

      // Set auth state
      setClientProfile(updatedClient);
      const userObj = createClientUserObj(updatedClient);
      setCurrentUser(userObj);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ uid: updatedClient.uid, email: updatedClient.email }));

      // Initialize / restore demo session in Firestore
      if (updatedClient.role === 'client') {
        const sess = await sessionService.initSessionForClient(
          updatedClient.uid,
          updatedClient.email,
          updatedClient.fullName,
          updatedClient.demoDurationMinutes,
          updatedClient.timerMode,
          updatedClient.accountExpiresAt
        );
        setCurrentSession(sess);
      } else {
        setCurrentSession(null);
      }

      // Record in audit log
      logService.recordLog(
        updatedClient.uid,
        updatedClient.email,
        updatedClient.role,
        'login',
        `User logged in via Firestore Client Authentication`
      );

      setIsLoading(false);
      return updatedClient;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  // Quick switch for reviewing and evaluating all scenarios seamlessly
  const quickLoginAs = async (roleType: 'admin' | 'client_active' | 'client_limited' | 'client_expired') => {
    setIsLoading(true);
    let targetClient: ClientProfile;

    if (roleType === 'admin') {
      targetClient = DEFAULT_CLIENTS.find(c => c.uid === 'admin_karim')!;
    } else if (roleType === 'client_active') {
      targetClient = DEFAULT_CLIENTS.find(c => c.uid === 'client_active_sarah')!;
    } else if (roleType === 'client_limited') {
      targetClient = DEFAULT_CLIENTS.find(c => c.uid === 'client_limited_alex')!;
    } else {
      targetClient = DEFAULT_CLIENTS.find(c => c.uid === 'client_expired_marcus')!;
    }

    try {
      // Sync to Firestore
      await clientService.saveClient(targetClient);
    } catch (e) {
      console.warn('Sync profile note:', e);
    }

    setClientProfile(targetClient);
    setCurrentUser(createClientUserObj(targetClient));
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ uid: targetClient.uid, email: targetClient.email }));

    if (targetClient.role === 'client') {
      let sess = await sessionService.getSessionByClientId(targetClient.uid);
      if (!sess || (targetClient.timerMode && sess.timerMode !== targetClient.timerMode) || (sess.durationMinutes !== targetClient.demoDurationMinutes)) {
        sess = await sessionService.initSessionForClient(
          targetClient.uid,
          targetClient.email,
          targetClient.fullName,
          targetClient.demoDurationMinutes,
          targetClient.timerMode,
          targetClient.accountExpiresAt
        );
      }

      if (roleType === 'client_expired') {
        sess.status = 'expired';
        sess.expiresAt = Date.now() - 5000;
        await sessionService.markExpired(targetClient.uid);
      }
      setCurrentSession(sess);
    } else {
      setCurrentSession(null);
    }

    logService.recordLog(
      targetClient.uid,
      targetClient.email,
      targetClient.role,
      'login',
      `Switched persona to ${targetClient.fullName}`
    );

    setIsLoading(false);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setClientProfile(null);
    setCurrentSession(null);
  };

  const activateDemoSession = async (productId?: string, productTitle?: string) => {
    if (!clientProfile) return;
    setIsDemoOpen(true);
    await sessionService.activateSession(
      clientProfile.uid, 
      productId, 
      productTitle,
      clientProfile.timerMode,
      clientProfile.accountExpiresAt
    );
    logService.recordLog(
      clientProfile.uid,
      clientProfile.email,
      'client',
      'launch_demo',
      `Launched demo for: ${productTitle || productId || 'Product'} (Policy: ${clientProfile.timerMode || 'continuous'})`
    );
  };

  const resumeActiveUseSession = async () => {
    if (!clientProfile) return;
    setIsDemoOpen(true);
    setCurrentSession(prev => prev ? { ...prev, status: 'active', isAutoPaused: false, isDemoOpen: true } : prev);
    await sessionService.autoResumeSession(clientProfile.uid);
  };

  const pauseActiveSession = async () => {
    if (!clientProfile) return;
    setIsDemoOpen(false);
    // Immediately calculate and freeze remaining time in local state so countdown stops without delay
    setCurrentSession(prev => {
      if (!prev) return prev;
      const exactRemainingSec = sessionService.calculateRemainingSeconds(prev, clientProfile, false);
      return {
        ...prev,
        status: 'paused',
        isAutoPaused: false,
        isDemoOpen: false,
        pauseRemainingMs: exactRemainingSec * 1000
      };
    });
    await sessionService.pauseSession(clientProfile.uid, clientProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        clientProfile,
        currentSession,
        isAdmin,
        isClient,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        quickLoginAs,
        logout,
        activateDemoSession,
        resumeActiveUseSession,
        pauseActiveSession,
        isAutoPaused,
        isDemoOpen,
        setIsDemoOpen,
        remainingSeconds,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
