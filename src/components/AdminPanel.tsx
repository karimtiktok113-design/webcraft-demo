import React, { useState, useEffect } from 'react';
import { 
  ClientProfile, 
  Product, 
  DemoSession, 
  AccessRequest, 
  ActivityLog, 
  AdminSettings,
  ThemeName,
  TimerMode
} from '../types';
import { clientService } from '../services/clientService';
import { productService } from '../services/productService';
import { sessionService } from '../services/sessionService';
import { requestService } from '../services/requestService';
import { logService } from '../services/logService';
import { settingsService, DEFAULT_ADMIN_SETTINGS } from '../services/settingsService';
import { useAuth } from '../context/AuthContext';
import { ProductCustomizationModal } from './ProductCustomizationModal';
import { ClientProductAccessSelector } from './ClientProductAccessSelector';
import { ClientProductAccessModal } from './ClientProductAccessModal';
import { ClientTimerControlModal } from './ClientTimerControlModal';
import { ClientDeleteModal } from './ClientDeleteModal';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Radio, 
  FileText, 
  History, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Filter,
  Copy,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  ShoppingBag,
  Eye,
  KeyRound,
  CheckCircle2,
  Globe,
  Package
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onLaunchDemo: (product: Product) => void;
}

type AdminTab = 'dashboard' | 'clients' | 'products' | 'live_sessions' | 'requests' | 'logs' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products: initialProducts,
  onLaunchDemo
}) => {
  const { currentUser, clientProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Real-time Firestore state
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Filter & Search states
  const [searchClient, setSearchClient] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchLog, setSearchLog] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Product Customization Modal state
  // undefined: closed, null: create new, Product: edit existing
  const [customizingProduct, setCustomizingProduct] = useState<Product | null | undefined>(undefined);

  // Client Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [productAccessClient, setProductAccessClient] = useState<ClientProfile | null>(null);
  const [timerControlClient, setTimerControlClient] = useState<ClientProfile | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientProfile | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // New Client Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientOrg, setNewClientOrg] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('client123');
  const [newClientAccessCode, setNewClientAccessCode] = useState('');
  const [newClientDuration, setNewClientDuration] = useState(15);
  const [newClientTimerMode, setNewClientTimerMode] = useState<TimerMode>('continuous');
  const [newClientAllowedProds, setNewClientAllowedProds] = useState<string[]>(['*']);

  // Subscribe to real-time collections
  useEffect(() => {
    const unsubClients = clientService.subscribeClients(setClients);
    const unsubProducts = productService.subscribeProducts(setProducts);
    const unsubSessions = sessionService.subscribeAllSessions(setSessions);
    const unsubRequests = requestService.subscribeAllRequests(setRequests);
    const unsubLogs = logService.subscribeLogs(setLogs);
    const unsubSettings = settingsService.subscribeSettings(setSettings);

    return () => {
      unsubClients();
      unsubProducts();
      unsubSessions();
      unsubRequests();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  // Compute metrics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const suspendedClients = clients.filter(c => c.status === 'suspended').length;
  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const expiredSessions = sessions.filter(s => s.status === 'expired').length;
  const totalLaunches = products.reduce((acc, p) => acc + (p.demoLaunchesCount || 0), 0);
  const totalViews = products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  // Chart data
  const productChartData = products.map(p => ({
    name: p.title.split(' ')[0] + '...',
    launches: p.demoLaunchesCount || 10,
    views: p.viewsCount || 30
  }));

  const sessionTrendData = [
    { day: 'Mon', sessions: 18 },
    { day: 'Tue', sessions: 25 },
    { day: 'Wed', sessions: 32 },
    { day: 'Thu', sessions: 28 },
    { day: 'Fri', sessions: 45 },
    { day: 'Sat', sessions: 38 },
    { day: 'Sun', sessions: 42 },
  ];

  const pieData = [
    { name: 'Active Sessions', value: Math.max(activeSessions, 3), color: '#10b981' },
    { name: 'Idle Sessions', value: Math.max(sessions.filter(s => s.status === 'idle').length, 5), color: '#6366f1' },
    { name: 'Expired Sessions', value: Math.max(expiredSessions, 2), color: '#f43f5e' }
  ];

  // Client actions
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientEmail || !newClientName) return;

    const uid = `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const accessCode = newClientAccessCode.trim() || `WC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClient: ClientProfile = {
      uid,
      email: newClientEmail.trim().toLowerCase(),
      password: newClientPassword.trim() || 'client123',
      accessCode,
      fullName: newClientName.trim(),
      organization: newClientOrg.trim() || 'Client Organization',
      role: 'client',
      status: 'active',
      demoDurationMinutes: Number(newClientDuration),
      timerMode: newClientTimerMode,
      allowedProductIds: newClientAllowedProds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: Date.now()
    };

    await clientService.saveClient(newClient);
    await sessionService.initSessionForClient(uid, newClient.email, newClient.fullName, Number(newClientDuration));
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'create_client',
      `Provisioned client account: ${newClient.fullName} (${newClient.email}) with ${newClientDuration}m duration in Firestore`
    );

    setIsAddClientOpen(false);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientOrg('');
    setNewClientPassword('client123');
    setNewClientAccessCode('');
    setNewClientDuration(15);
    setNewClientTimerMode('continuous');
    setNewClientAllowedProds(['*']);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    await clientService.saveClient({
      ...editingClient,
      updatedAt: new Date().toISOString()
    });

    // Authoritatively sync duration update to live session
    if (editingClient.demoDurationMinutes) {
      await sessionService.updateSessionDuration(editingClient.uid, Number(editingClient.demoDurationMinutes));
    }

    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'update_client',
      `Updated profile, timer (${editingClient.demoDurationMinutes}m, ${editingClient.timerMode}), and digital product permissions (${editingClient.allowedProductIds.includes('*') ? 'Whole Catalog' : `${editingClient.allowedProductIds.length} tools`}) for client ${editingClient.fullName}`
    );

    setEditingClient(null);
  };

  const handleToggleSuspend = async (client: ClientProfile) => {
    if (client.role === 'admin' || client.uid === 'admin_karim' || client.email.toLowerCase().includes('karim')) {
      alert('The Master Administrator account is permanently active and cannot be suspended.');
      return;
    }
    const nextStatus = client.status === 'active' ? 'suspended' : 'active';
    await clientService.updateClientStatus(client.uid, nextStatus);
    if (nextStatus === 'suspended') {
      await sessionService.revokeSession(client.uid);
    }
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'suspend_client',
      `Changed client status to ${nextStatus} for ${client.fullName}`
    );
  };

  const handleExecuteDelete = async (options: {
    softDelete: boolean;
    deleteSession: boolean;
    deleteRequests: boolean;
    recordAudit: boolean;
    reason: string;
  }) => {
    if (!deletingClient) return;
    if (deletingClient.role === 'admin' || deletingClient.uid === 'admin_karim' || deletingClient.email.toLowerCase().includes('karim')) {
      alert('The Master Administrator account is permanently protected and cannot be deleted.');
      return;
    }

    setIsDeletingClient(true);
    try {
      await clientService.deleteClientWithCascade(deletingClient.uid, {
        softDelete: options.softDelete,
        deleteSession: options.deleteSession,
        deleteRequests: options.deleteRequests,
        reason: options.reason
      });

      if (options.recordAudit) {
        logService.recordLog(
          currentUser?.uid || 'admin',
          currentUser?.email || 'admin',
          'admin',
          options.softDelete ? 'revoke_client' : 'delete_client',
          `${options.softDelete ? 'Revoked' : 'Permanently purged'} client ${deletingClient.fullName} (${deletingClient.email}). Options: session=${options.deleteSession}, requests=${options.deleteRequests}. Reason: ${options.reason}`
        );
      }

      setDeletingClient(null);
    } catch (err: any) {
      alert(err.message || 'Failed to complete client deletion.');
    } finally {
      setIsDeletingClient(false);
    }
  };

  const handleCopyCredentials = (client: ClientProfile) => {
    const text = `WebCraft Client Login:\nEmail: ${client.email}\nPassword: ${client.password || 'client123'}\nAccess Code: ${client.accessCode || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedUid(client.uid);
    setTimeout(() => setCopiedUid(null), 2500);
  };

  const handleExtendTime = async (clientId: string, minutes: number) => {
    await sessionService.extendSessionTime(clientId, minutes);
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'extend_time',
      `Extended session time by +${minutes}m for client ${clientId}`
    );
  };

  const handleResetSession = async (clientId: string) => {
    await sessionService.resetSession(clientId);
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'reset_session',
      `Reset demo session to idle state for client ${clientId}`
    );
  };

  // Product Save & Customization Handlers
  const handleSaveCustomProduct = async (prod: Product) => {
    await productService.saveProduct(prod);
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'save_product',
      `Customized and saved product "${prod.title}" (${prod.category}) to Firestore`
    );
  };

  const handleDuplicateProduct = async (prod: Product) => {
    const newId = `${prod.id}-copy-${Date.now().toString().slice(-4)}`;
    const cloned: Product = {
      ...prod,
      id: newId,
      title: `${prod.title} (Custom Copy)`,
      demoLaunchesCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await productService.saveProduct(cloned);
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'duplicate_product',
      `Cloned product "${prod.title}" to "${cloned.title}"`
    );
  };

  const handleTogglePublish = async (prod: Product) => {
    const updated: Product = {
      ...prod,
      isPublished: !prod.isPublished,
      updatedAt: new Date().toISOString()
    };
    await productService.saveProduct(updated);
    logService.recordLog(
      currentUser?.uid || 'admin',
      currentUser?.email || 'admin',
      'admin',
      'toggle_publish',
      `${updated.isPublished ? 'Published (Live)' : 'Unpublished (Draft)'} product "${prod.title}"`
    );
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (confirm(`Delete product "${prod.title}" from catalog?`)) {
      await productService.deleteProduct(prod.id);
      logService.recordLog(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin',
        'admin',
        'delete_product',
        `Deleted product "${prod.title}" from Firestore`
      );
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchProduct.toLowerCase()) || 
      p.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Administrative Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            WebCraft Goods Portal Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Cloud Firestore synchronization • Full product customization • Client credentials & timer controls
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
          <button
            onClick={() => setCustomizingProduct(null)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-purple-500/20 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Upload & Customize Product</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
          { id: 'clients', label: 'Client Accounts', icon: Users, badge: clients.length },
          { id: 'live_sessions', label: 'Live Sessions Monitor', icon: Radio, badge: activeSessions },
          { id: 'products', label: 'Product Catalog', icon: Layers, badge: products.length },
          { id: 'requests', label: 'Access Requests', icon: FileText, badge: pendingRequests },
          { id: 'logs', label: 'Security & Audit Logs', icon: History },
          { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Clients</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {activeClients}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {suspendedClients} suspended • {totalClients} total accounts
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Live Demo Sessions</span>
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {activeSessions}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {expiredSessions} expired sessions
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Demo Launches</span>
                <Play className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {totalLaunches}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {totalViews} catalog product impressions
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {pendingRequests}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Extensions and access inquiries
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Product Engagement */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Product Demo Launches & Views
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="launches" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Launches" />
                    <Bar dataKey="views" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily Demo Activity */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Daily Demo Session Volume
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionTrendData}>
                    <defs>
                      <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#sessionGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLIENT ACCOUNTS */}
      {activeTab === 'clients' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Authorized Client Directory ({clients.length})
              </h2>
              <p className="text-xs text-slate-500">
                All client credentials and countdown timer durations synchronize directly with Cloud Firestore.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  placeholder="Search client by name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setIsAddClientOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Client User</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Login Credentials</th>
                  <th className="p-3.5">Demo Duration</th>
                  <th className="p-3.5">Allowed Tools</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clients
                  .filter(c => c.fullName.toLowerCase().includes(searchClient.toLowerCase()) || c.email.toLowerCase().includes(searchClient.toLowerCase()))
                  .map((c) => (
                    <tr key={c.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{c.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.email}</div>
                        {c.organization && <div className="text-[10px] text-indigo-500">{c.organization}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-[11px]">
                            <span className="text-slate-500">pw:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{c.password || 'client123'}</span>
                            {c.accessCode && (
                              <div className="text-[10px] text-purple-600 dark:text-purple-400">code: {c.accessCode}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopyCredentials(c)}
                            className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                            title="Copy credentials to clipboard"
                          >
                            {copiedUid === c.uid ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setTimerControlClient(c)}
                          className="font-bold font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer group"
                          title="Open live timer countdown and duration controls"
                        >
                          <Clock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span className="underline decoration-dotted">{c.demoDurationMinutes} mins</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setProductAccessClient(c)}
                          className="cursor-pointer group flex items-center gap-1"
                          title="Click to customize digital product access"
                        >
                          {c.allowedProductIds.includes('*') ? (
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-indigo-500" />
                              <span>Full Catalog ({products.length})</span>
                              <Sliders className="w-2.5 h-2.5 opacity-50" />
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px] group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition flex items-center gap-1.5">
                              <Package className="w-3 h-3 text-purple-500" />
                              <span>{c.allowedProductIds.length} Tools Allowed</span>
                              <Sliders className="w-2.5 h-2.5 opacity-50" />
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {c.role === 'admin' || c.uid === 'admin_karim' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              Active Master Admin
                            </span>
                            <button
                              onClick={() => setEditingClient(c)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[11px] transition cursor-pointer"
                              title="Edit admin details"
                            >
                              <Edit3 className="w-3 h-3 inline" />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Product Access Customization */}
                            <button
                              onClick={() => setProductAccessClient(c)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg font-bold text-[11px] transition cursor-pointer"
                              title="Customize digital products whitelist"
                            >
                              <Sliders className="w-3 h-3 inline mr-1" />
                              <span>Tools</span>
                            </button>
                            {/* Timer Customization Studio */}
                            <button
                              onClick={() => setTimerControlClient(c)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-[11px] transition cursor-pointer"
                              title="Customize live countdown and demo duration"
                            >
                              <Clock className="w-3 h-3 inline mr-1" />
                              <span>Timer</span>
                            </button>
                            {/* Edit Client Profile */}
                            <button
                              onClick={() => setEditingClient(c)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[11px] transition cursor-pointer"
                              title="Edit profile & permissions"
                            >
                              <Edit3 className="w-3 h-3 inline" />
                            </button>
                            {/* Suspend/Reactivate */}
                            <button
                              onClick={() => handleToggleSuspend(c)}
                              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                c.status === 'active'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={c.status === 'active' ? 'Suspend account' : 'Reactivate account'}
                            >
                              {c.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                            {/* Delete Customization */}
                            <button
                              onClick={() => setDeletingClient(c)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-lg font-bold text-[11px] transition cursor-pointer"
                              title="Open deletion and cascade cleanup studio"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LIVE SESSIONS MONITOR */}
      {activeTab === 'live_sessions' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Real-Time Client Session Monitor
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative countdown status updating in real-time from Cloud Firestore.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Client User</th>
                  <th className="p-3.5">Session Status</th>
                  <th className="p-3.5">Active Product</th>
                  <th className="p-3.5">Remaining Countdown</th>
                  <th className="p-3.5">Last Heartbeat</th>
                  <th className="p-3.5 text-right">Admin Interventions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((s) => {
                  const remainingSec = sessionService.calculateRemainingSeconds(s);
                  const h = Math.floor(remainingSec / 3600);
                  const m = Math.floor((remainingSec % 3600) / 60);
                  const sec = remainingSec % 60;
                  const formatted = `${h > 0 ? `${h}h ` : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

                  return (
                    <tr key={s.clientId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{s.clientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.clientEmail}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : s.status === 'expired'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {s.currentProductTitle || <span className="text-slate-400 italic">None viewed yet</span>}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {s.status === 'expired' ? '00:00:00 (Expired)' : s.status === 'idle' ? `${s.durationMinutes}m (Idle)` : formatted}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {s.lastHeartbeat ? new Date(s.lastHeartbeat).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleExtendTime(s.clientId, 15)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition"
                          title="Grant +15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => handleResetSession(s.clientId)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition"
                          title="Reset to initial idle time"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => sessionService.revokeSession(s.clientId)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-600 text-[11px] font-bold rounded-lg transition"
                          title="Terminate demo immediately"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS MANAGEMENT WITH FULL CUSTOMIZATION */}
      {activeTab === 'products' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Digital Products Catalog ({products.length})
              </h2>
              <p className="text-xs text-slate-500">
                Full customization of all product features, purchase links, demo sandbox options, and HTML code.
              </p>
            </div>
            
            <button
              onClick={() => setCustomizingProduct(null)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-purple-500/20 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Upload New Tool</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Search products by title, category, or features..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Categories ({products.length})</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const linksCount = (p.externalLinks ? Object.keys(p.externalLinks).filter(k => Boolean((p.externalLinks as any)[k])).length : 0) + (p.purchaseUrl ? 1 : 0);

              return (
                <div 
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition shadow-xs"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                      
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          {p.version}
                        </span>
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white backdrop-blur-xs">
                            ★ {p.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition shadow-xs ${
                            p.isPublished
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {p.isPublished ? 'Live' : 'Draft'}
                        </button>
                      </div>

                      {p.price && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-emerald-400 font-bold font-mono text-[11px] backdrop-blur-xs">
                          {p.price}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.shortDescription}</p>
                    </div>

                    {/* Features & Links Counters */}
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        {p.features?.length || 0} features
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        <LinkIcon className="w-3 h-3 text-indigo-500" />
                        {linksCount} links
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.demoLaunchesCount || 0} Launches
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Launch Demo */}
                      <button
                        onClick={() => onLaunchDemo(p)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1"
                        title="Test demo viewer"
                      >
                        <Play className="w-3 h-3 fill-current" /> Demo
                      </button>

                      {/* Full Customization */}
                      <button
                        onClick={() => setCustomizingProduct(p)}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1"
                        title="Customize all features, links, and HTML"
                      >
                        <Sliders className="w-3 h-3" /> Customize
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicateProduct(p)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                        title="Duplicate tool"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCESS REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Client Time & Access Requests
            </h2>
            <p className="text-xs text-slate-500">
              Approve client requests for extra sandbox evaluation time or specific catalog tools.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Client User</th>
                  <th className="p-3.5">Request Type</th>
                  <th className="p-3.5">Target Tool / Time</th>
                  <th className="p-3.5">Client Note</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{r.clientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.clientEmail}</div>
                    </td>
                    <td className="p-3.5 capitalize font-semibold text-slate-700 dark:text-slate-300">
                      {r.requestType.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 font-medium">
                      {r.requestedMinutes ? `${r.requestedMinutes} mins requested` : r.productTitle || 'Full catalog'}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {r.message}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : r.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              await requestService.updateRequestStatus(r.id, 'approved', 'Approved by administrator');
                              if (r.requestedMinutes) {
                                await sessionService.extendSessionTime(r.clientId, r.requestedMinutes);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => requestService.updateRequestStatus(r.id, 'rejected', 'Declined by administrator')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-[11px]"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Administrative Audit & Security Trail
              </h2>
              <p className="text-xs text-slate-500">
                Authoritative security event log synchronized in real-time from Cloud Firestore.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {logs
                  .filter(l => l.action.toLowerCase().includes(searchLog.toLowerCase()) || l.details.toLowerCase().includes(searchLog.toLowerCase()))
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {log.actorEmail}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.actorRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Global Portal Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure defaults stored in Cloud Firestore under `/adminSettings/global`.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await settingsService.updateSettings(settings);
              alert('Global settings saved to Firestore.');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portal Showcase Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Demo Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.defaultDemoDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, defaultDemoDurationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Etsy Store Link
              </label>
              <input
                type="url"
                value={settings.etsyStoreUrl}
                onChange={(e) => setSettings({ ...settings, etsyStoreUrl: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 cursor-pointer"
            >
              Save Global Configuration
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADD CLIENT WITH SYNCHRONIZED CREDENTIALS & PRODUCT PERMISSIONS */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Authorized Client</h3>
                <p className="text-xs text-slate-500">Stored directly in Firestore collection <code className="font-mono">/clients/{'{uid}'}</code></p>
              </div>
              <button 
                onClick={() => setIsAddClientOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Password</label>
                  <input
                    type="text"
                    required
                    value={newClientPassword}
                    onChange={(e) => setNewClientPassword(e.target.value)}
                    placeholder="client123"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Access Code (Optional)</label>
                  <input
                    type="text"
                    value={newClientAccessCode}
                    onChange={(e) => setNewClientAccessCode(e.target.value)}
                    placeholder="e.g. WC-2026-9812"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
                  <input
                    type="text"
                    value={newClientOrg}
                    onChange={(e) => setNewClientOrg(e.target.value)}
                    placeholder="Studio Creative"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Demo Duration (Minutes)</label>
                  <select
                    value={newClientDuration}
                    onChange={(e) => setNewClientDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes (Default)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                    <option value={1440}>1440 Minutes (24 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Timer Mode Policy</label>
                  <select
                    value={newClientTimerMode}
                    onChange={(e) => setNewClientTimerMode(e.target.value as TimerMode)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="continuous">Continuous Countdown</option>
                    <option value="active_use">Active Use Tracking</option>
                    <option value="scheduled">Scheduled Expiry</option>
                  </select>
                </div>
              </div>

              {/* Digital Products Permissions Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <ClientProductAccessSelector
                  products={products}
                  allowedProductIds={newClientAllowedProds}
                  onChange={setNewClientAllowedProds}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Provision Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIENT WITH FULL CUSTOMIZATION */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Customize Client Account Profile
                </h3>
                <p className="text-xs text-slate-500 font-mono">{editingClient.email}</p>
              </div>
              <button 
                onClick={() => setEditingClient(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.fullName}
                    onChange={(e) => setEditingClient({ ...editingClient, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="text"
                    value={editingClient.password || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, password: e.target.value })}
                    placeholder="client123"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Access Code</label>
                  <input
                    type="text"
                    value={editingClient.accessCode || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, accessCode: e.target.value })}
                    placeholder="e.g. SARAH-2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
                  <input
                    type="text"
                    value={editingClient.organization || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, organization: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Demo Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={editingClient.demoDurationMinutes}
                    onChange={(e) => setEditingClient({ ...editingClient, demoDurationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editingClient.status}
                    disabled={editingClient.uid === 'admin_karim' || editingClient.role === 'admin'}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>

              {/* Timer Mode and Quick Presets */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Timer Mode Policy
                  </label>
                  <div className="flex items-center gap-1">
                    {[10, 15, 30, 60, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setEditingClient({ ...editingClient, demoDurationMinutes: mins })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          editingClient.demoDurationMinutes === mins
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'continuous', label: 'Continuous Countdown', desc: 'Real-time countdown once activated' },
                    { id: 'active_use', label: 'Active Usage Tracking', desc: 'Active browser evaluation time' },
                    { id: 'scheduled', label: 'Fixed Expiry Schedule', desc: 'Scheduled calendar window' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setEditingClient({ ...editingClient, timerMode: mode.id as TimerMode })}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        editingClient.timerMode === mode.id
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{mode.label}</div>
                      <div className="text-[9px] opacity-75">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Products Permissions Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <ClientProductAccessSelector
                  products={products}
                  allowedProductIds={editingClient.allowedProductIds || ['*']}
                  onChange={(ids) => setEditingClient({ ...editingClient, allowedProductIds: ids })}
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Administrative Notes
                </label>
                <input
                  type="text"
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="e.g. VIP client evaluating full catalog for enterprise deployment"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Save Client Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PRODUCT CUSTOMIZATION STUDIO MODAL */}
      <ProductCustomizationModal
        isOpen={customizingProduct !== undefined}
        initialProduct={customizingProduct}
        onClose={() => setCustomizingProduct(undefined)}
        onSave={handleSaveCustomProduct}
      />

      {/* DEDICATED DIGITAL PRODUCTS ACCESS MODAL */}
      <ClientProductAccessModal
        isOpen={Boolean(productAccessClient)}
        client={productAccessClient}
        products={products}
        onClose={() => setProductAccessClient(null)}
      />

      {/* DEDICATED TIMER CUSTOMIZATION STUDIO MODAL */}
      <ClientTimerControlModal
        isOpen={Boolean(timerControlClient)}
        client={timerControlClient}
        onClose={() => setTimerControlClient(null)}
      />

      {/* DEDICATED CLIENT DELETION & CASCADE CLEANUP MODAL */}
      <ClientDeleteModal
        isOpen={Boolean(deletingClient)}
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleExecuteDelete}
        isDeleting={isDeletingClient}
      />

    </div>
  );
};
