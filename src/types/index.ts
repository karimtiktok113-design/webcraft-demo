export type UserRole = 'admin' | 'client';
export type AccountStatus = 'active' | 'suspended' | 'revoked';
export type TimerMode = 'continuous' | 'active_use' | 'scheduled';
export type SessionStatus = 'idle' | 'active' | 'paused' | 'expired' | 'revoked';

export type ThemeName = 
  | 'premium-light'
  | 'professional-dark'
  | 'midnight-navy'
  | 'royal-purple'
  | 'ocean-blue'
  | 'emerald'
  | 'slate'
  | 'minimal-white';

export interface ClientProfile {
  uid: string;
  email: string;
  password?: string;
  accessCode?: string;
  fullName: string;
  organization?: string;
  role: UserRole;
  status: AccountStatus;
  demoDurationMinutes: number;
  timerMode: TimerMode;
  allowedProductIds: string[]; // ['*'] means all
  preferredTheme?: ThemeName;
  accountExpiresAt?: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: number;
}

export interface ProductExternalLinks {
  etsyUrl?: string;
  gumroadUrl?: string;
  docsUrl?: string;
  videoUrl?: string;
  supportUrl?: string;
  demoWebsiteUrl?: string;
}

export interface ProductSandboxOptions {
  allowStorageIsolation?: boolean;
  enableResetButton?: boolean;
  customHeaderNote?: string;
  suggestedDurationMinutes?: number;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  badge?: string;
  price?: string;
  originalPrice?: string;
  shortDescription: string;
  description: string;
  targetAudience?: string;
  thumbnailUrl: string;
  screenshots?: string[];
  version: string;
  isPublished: boolean;
  features: string[];
  supportedDevices?: string[];
  purchaseUrl: string;
  externalLinks?: ProductExternalLinks;
  demoHtml: string;
  demoInstructions?: string;
  tags?: string[];
  sandboxOptions?: ProductSandboxOptions;
  viewsCount: number;
  demoLaunchesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoSession {
  sessionId: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  status: SessionStatus;
  currentProductId?: string;
  currentProductTitle?: string;
  durationMinutes: number;
  timerMode?: TimerMode;
  scheduledExpiresAt?: number | null;
  startedAt?: number;
  expiresAt?: number;
  lastHeartbeat?: number;
  lastActiveAt?: number;
  pauseRemainingMs?: number;
  isAutoPaused?: boolean;
  isDemoOpen?: boolean;
}

export type RequestType = 'time_extension' | 'product_access' | 'issue_report' | 'general_inquiry';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
  id: string;
  clientId: string;
  clientEmail: string;
  clientName: string;
  requestType: RequestType;
  requestedMinutes?: number;
  productId?: string;
  productTitle?: string;
  message: string;
  status: RequestStatus;
  adminNotes?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface AdminSettings {
  id: string;
  siteName: string;
  tagline: string;
  defaultDemoDurationMinutes: number;
  defaultTheme: ThemeName;
  timerWarningThresholds: number[]; // e.g. [10, 5, 1]
  supportEmail: string;
  etsyStoreUrl: string;
  allowClientThemeChange: boolean;
  requireActivationClick: boolean;
}
