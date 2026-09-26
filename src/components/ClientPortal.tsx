import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, ThemeName } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCT_CATEGORIES } from '../data/defaultProducts';
import { useTheme } from '../context/ThemeContext';
import { clientService } from '../services/clientService';
import { 
  LayoutDashboard, 
  Grid, 
  CheckCircle, 
  Clock, 
  LifeBuoy, 
  Settings, 
  Search, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Send,
  Lock,
  Calendar,
  Activity,
  Pause
} from 'lucide-react';

interface ClientPortalProps {
  products: Product[];
  onLaunchDemo: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onRequestTime: (product?: Product) => void;
  onRequireLogin: () => void;
}

type TabType = 'dashboard' | 'all_products' | 'my_accessible' | 'my_session' | 'support' | 'settings';

export const ClientPortal: React.FC<ClientPortalProps> = ({
  products,
  onLaunchDemo,
  onViewDetails,
  onRequestTime,
  onRequireLogin
}) => {
  const { 
    clientProfile, 
    currentSession, 
    remainingSeconds, 
    activateDemoSession, 
    refreshProfile, 
    logout,
    isAutoPaused,
    isDemoOpen,
    resumeActiveUseSession
  } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Support ticket form state
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Filter accessible products
  const accessibleProducts = products.filter(p => {
    if (!clientProfile) return false;
    return clientProfile.allowedProductIds.includes('*') || clientProfile.allowedProductIds.includes(p.id);
  });

  const effectiveMode = clientProfile?.timerMode || currentSession?.timerMode || 'continuous';

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  
  let timeFormatted = '';
  if (effectiveMode === 'scheduled' && days > 0) {
    timeFormatted = `${days}d ${hours}h ${minutes}m`;
  } else {
    timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const isSessionActive = currentSession?.status === 'active';
  const isSessionExpired = currentSession?.status === 'expired' || (isSessionActive && remainingSeconds <= 0);
  const isSessionIdle = currentSession?.status === 'idle';
  const isDemoClosedPaused = effectiveMode === 'active_use' && (!isDemoOpen || !currentSession?.isDemoOpen) && !isSessionIdle && !isSessionExpired;

  const handleStartSession = async (prod?: Product) => {
    await activateDemoSession(prod?.id, prod?.title);
    if (prod) {
      onLaunchDemo(prod);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all_products', label: 'All Catalog Tools', icon: Grid },
    { id: 'my_accessible', label: 'My Accessible Tools', icon: CheckCircle, badge: accessibleProducts.length },
    { id: 'my_session', label: 'My Demo Session', icon: Clock },
    { id: 'support', label: 'Help & Support', icon: LifeBuoy },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Portal Menu</span>
        </button>
        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
          {timeFormatted} Remaining
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <aside className={`lg:block ${mobileMenuOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-sm">
            
            {/* User Mini Profile */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-inner">
                {clientProfile?.fullName?.charAt(0) || 'C'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {clientProfile?.fullName || 'Client User'}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {clientProfile?.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {clientProfile?.status} Client
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Demo Session Card in Sidebar */}
            <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
              isSessionExpired 
                ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 text-rose-800 dark:text-rose-300' 
                : 'bg-indigo-50/60 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Demo Countdown
                </span>
                <span className="font-mono text-xs">
                  {isSessionExpired ? 'EXPIRED' : timeFormatted}
                </span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                {isSessionIdle
                  ? 'Your demo timer starts continuously upon launching your first tool.'
                  : isSessionExpired
                  ? 'Your allotted time has finished. Request extra time below.'
                  : 'Timer runs continuously until expiry.'}
              </p>
              <button
                onClick={() => onRequestTime()}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition"
              >
                Request More Time
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Auto-Paused Banner for Active Use Policy */}
          {isAutoPaused && isDemoOpen && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span>Active Usage Evaluation Auto-Paused (Idle)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px]">
                      Time Conserved
                    </span>
                  </p>
                  <p className="text-[11px] opacity-85 mt-0.5">
                    The timer was auto-paused because you were inactive or on another tab. Your evaluation allowance ({timeFormatted} remaining) is safely preserved.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resumeActiveUseSession}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Timer</span>
              </button>
            </div>
          )}

          {/* Reassuring Notice for Active Use Policy when Demo is Closed */}
          {isDemoClosedPaused && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span>Active Use Tracking: Timer Paused (Demo Inactive)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                      Time Frozen
                    </span>
                  </p>
                  <p className="text-[11px] opacity-85 mt-0.5">
                    Your evaluation allowance is safely frozen at <strong>{timeFormatted}</strong>. Under Active Use policy, time is only consumed while an interactive tool is open and in use. Launch any tool below to test!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-white/20 text-white backdrop-blur-md">
                    Authorized Client Space
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome, {clientProfile?.fullName || 'Client'}
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                    You have access to <strong className="text-white">{accessibleProducts.length}</strong> interactive digital tools. Launch any demonstration below to test formulas, trackers, and printable layouts.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-[170px] space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Remaining Allowance</span>
                  <div className="font-mono text-2xl font-black text-white">
                    {isSessionExpired 
                      ? '00:00:00' 
                      : isDemoClosedPaused
                        ? `PAUSED: ${timeFormatted}`
                        : isAutoPaused 
                          ? `PAUSED: ${timeFormatted}` 
                          : timeFormatted}
                  </div>
                  <span className="text-[10px] text-indigo-200 block font-medium">
                    {effectiveMode === 'active_use' ? '⚡ Active Use Tracking' : effectiveMode === 'scheduled' ? '📅 Fixed Expiry Schedule' : '⏱ Continuous Countdown'}
                  </span>
                </div>
              </div>

              {/* KPI Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Session Status</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 capitalize flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isDemoClosedPaused 
                        ? 'bg-amber-500' 
                        : isSessionActive 
                          ? 'bg-emerald-500 animate-pulse' 
                          : isSessionExpired 
                            ? 'bg-rose-500' 
                            : 'bg-amber-500'
                    }`} />
                    {isDemoClosedPaused 
                      ? 'Paused (Demo Inactive)' 
                      : (currentSession?.status || 'idle')}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Accessible Products</span>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {accessibleProducts.length} Tools
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Initial Allowance</span>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {clientProfile?.demoDurationMinutes || 15} Mins
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">Account Status</span>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 capitalize">
                    {clientProfile?.status || 'Active'}
                  </p>
                </div>
              </div>

              {/* Ready to Test Demos Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Your Authorized Digital Products
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Click to launch sandboxed demonstrations
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('all_products')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all ({products.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {accessibleProducts.slice(0, 4).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onLaunchDemo={onLaunchDemo}
                      onViewDetails={onViewDetails}
                      onRequestAccess={() => onRequestTime(prod)}
                      onRequireLogin={onRequireLogin}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ALL PRODUCTS */}
          {activeTab === 'all_products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Full Product Library
                  </h2>
                  <p className="text-xs text-slate-500">
                    Browse all WebCraft Goods digital tools. Unlocked tools can be tested immediately.
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products
                  .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onLaunchDemo={onLaunchDemo}
                      onViewDetails={onViewDetails}
                      onRequestAccess={() => onRequestTime(prod)}
                      onRequireLogin={onRequireLogin}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* TAB: MY ACCESSIBLE */}
          {activeTab === 'my_accessible' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Assigned Products ({accessibleProducts.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Products explicitly provisioned for your client account by administrator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {accessibleProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onLaunchDemo={onLaunchDemo}
                    onViewDetails={onViewDetails}
                    onRequestAccess={() => onRequestTime(prod)}
                    onRequireLogin={onRequireLogin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: MY DEMO SESSION */}
          {activeTab === 'my_session' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Authoritative Timer Synchronization
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Demo Session Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your session countdown is continuously enforced server-side.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">Current Remaining</span>
                  <p className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {timeFormatted}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">Timer Policy</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize flex items-center gap-1.5">
                    {effectiveMode === 'active_use' && <Activity className="w-4 h-4 text-cyan-600" />}
                    {effectiveMode === 'scheduled' && <Calendar className="w-4 h-4 text-purple-600" />}
                    {effectiveMode === 'continuous' && <Clock className="w-4 h-4 text-indigo-600" />}
                    <span>
                      {effectiveMode === 'active_use' ? 'Active Use Tracking' : effectiveMode === 'scheduled' ? 'Scheduled Expiry' : 'Continuous Countdown'}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {effectiveMode === 'active_use' 
                      ? 'Depletes only during active interaction; auto-pauses when idle' 
                      : effectiveMode === 'scheduled' 
                        ? (clientProfile?.accountExpiresAt || currentSession?.scheduledExpiresAt 
                            ? `Valid until ${new Date(clientProfile?.accountExpiresAt || currentSession?.scheduledExpiresAt || 0).toLocaleString()}` 
                            : 'Fixed calendar evaluation window') 
                        : 'Runs continuously once started'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">Allocated Duration</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {currentSession?.durationMinutes || 15} Minutes Total
                  </p>
                </div>
              </div>

              {isSessionIdle && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Your demo timer is idle and will start when you launch your first tool.</span>
                  </div>
                  <button
                    onClick={() => handleStartSession(accessibleProducts[0])}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                  >
                    Start Timer Now
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">Need more time for testing with your team?</span>
                <button
                  onClick={() => onRequestTime()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Request Time Extension
                </button>
              </div>
            </div>
          )}

          {/* TAB: SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Help & Client Support
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Have questions regarding your demo, need an extension, or found an issue? Send a direct note to the administrator.
                </p>
              </div>

              {supportSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  Thank you! Your inquiry was recorded in Firestore and the administrator was notified.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!supportMsg) return;
                    onRequestTime();
                    setSupportSuccess(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Support Inquiries & Product Feedback
                    </label>
                    <textarea
                      rows={4}
                      value={supportMsg}
                      onChange={(e) => setSupportMsg(e.target.value)}
                      placeholder="Type your message, issue report, or feedback here..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Admin</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Client Profile & Preferences
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your preferred interface theme and account metadata.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {clientProfile?.fullName}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    {clientProfile?.email}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Interface Theme (Persisted in Firestore)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableThemes.map((t) => (
                      <button
                        key={t.id}
                        onClick={async () => {
                          setTheme(t.id);
                          if (clientProfile) {
                            await clientService.updateClientTheme(clientProfile.uid, t.id);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                          theme === t.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{t.name}</span>
                        {theme === t.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
