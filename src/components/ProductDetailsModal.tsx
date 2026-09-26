import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Play, 
  Lock, 
  ShoppingBag, 
  ExternalLink, 
  CheckCircle2, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Video,
  HelpCircle,
  Globe,
  Tag,
  DollarSign
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchDemo: (product: Product) => void;
  onRequireLogin: () => void;
  onRequestAccess?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onLaunchDemo,
  onRequireLogin,
  onRequestAccess
}) => {
  const { currentUser, clientProfile, currentSession, remainingSeconds, isAdmin, isClient } = useAuth();

  if (!isOpen || !product) return null;

  const isAuthenticated = Boolean(currentUser);
  const isAccountActive = clientProfile?.status === 'active';
  const isExpired = isClient && (currentSession?.status === 'expired' || (currentSession?.status === 'active' && remainingSeconds <= 0));
  
  const hasProductPermission = isAdmin || (
    clientProfile?.allowedProductIds?.includes('*') ||
    clientProfile?.allowedProductIds?.includes(product.id)
  );

  const canLaunch = isAuthenticated && isAccountActive && !isExpired && hasProductPermission;

  const handleLaunch = () => {
    if (!isAuthenticated) {
      onClose();
      onRequireLogin();
      return;
    }
    if (!hasProductPermission) {
      if (onRequestAccess) onRequestAccess(product);
      return;
    }
    onClose();
    onLaunchDemo(product);
  };

  const links = product.externalLinks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {product.category}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {product.version}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                ★ {product.badge}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual Banner */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.price && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-white flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="font-extrabold text-sm text-emerald-400">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">{product.originalPrice}</span>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {product.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || product.shortDescription}
            </p>
            {product.targetAudience && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                🎯 Best suited for: {product.targetAudience}
              </p>
            )}
          </div>

          {/* Feature List (All Features) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Included Capabilities & Core Features ({product.features.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.features.map((feat, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Compatibility */}
          {product.supportedDevices && product.supportedDevices.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Supported Environments & Compatibility
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.supportedDevices.map((dev, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    {dev}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Product Links & Resources */}
          {(links?.gumroadUrl || links?.docsUrl || links?.videoUrl || links?.supportUrl || links?.demoWebsiteUrl) && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Official Links & Resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {links.demoWebsiteUrl && (
                  <a
                    href={links.demoWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>External Demo Site</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {links.gumroadUrl && (
                  <a
                    href={links.gumroadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Gumroad Direct Checkout</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {links.docsUrl && (
                  <a
                    href={links.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>User Documentation</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {links.videoUrl && (
                  <a
                    href={links.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Tutorial</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {links.supportUrl && (
                  <a
                    href={links.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Support & Inquiry</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.tags.map((t) => (
                <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Security & Isolation Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-indigo-900 dark:text-indigo-200">
                Interactive Demonstration Sandbox
              </p>
              <p className="text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                {product.sandboxOptions?.customHeaderNote || 
                  'This digital product launches in an isolated iframe. Any sample tasks, events, and inputs entered during your test demo are privately namespaced to your client ID and do not alter the master catalog.'
                }
              </p>
              {product.demoInstructions && (
                <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-indigo-200/50 dark:border-indigo-900/50">
                  💡 <span className="font-semibold">Tip:</span> {product.demoInstructions}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs text-slate-400">WebCraft Goods Instant Delivery</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Personalized Client Demo Access
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {product.purchaseUrl && (
              <a
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy on Etsy {product.price ? `(${product.price})` : ''}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            )}

            {canLaunch ? (
              <button
                onClick={handleLaunch}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Interactive Demo</span>
              </button>
            ) : isExpired ? (
              <button
                onClick={handleLaunch}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900 hover:bg-rose-100 transition flex items-center justify-center gap-2"
              >
                <span>Demo Expired (Request Time)</span>
              </button>
            ) : !hasProductPermission && isAuthenticated ? (
              <button
                onClick={handleLaunch}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Request Product Access</span>
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Client Login Required</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
