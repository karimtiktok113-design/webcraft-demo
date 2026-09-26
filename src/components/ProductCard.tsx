import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Lock, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onLaunchDemo: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onRequestAccess?: (product: Product) => void;
  onRequireLogin: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onLaunchDemo,
  onViewDetails,
  onRequestAccess,
  onRequireLogin
}) => {
  const { currentUser, clientProfile, currentSession, remainingSeconds, isAdmin, isClient } = useAuth();

  // Determine access rights
  const isAuthenticated = Boolean(currentUser);
  const isAccountActive = clientProfile?.status === 'active';
  const isExpired = isClient && (currentSession?.status === 'expired' || (currentSession?.status === 'active' && remainingSeconds <= 0));
  
  const hasProductPermission = isAdmin || (
    clientProfile?.allowedProductIds?.includes('*') ||
    clientProfile?.allowedProductIds?.includes(product.id)
  );

  const canLaunch = isAuthenticated && isAccountActive && !isExpired && hasProductPermission;

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    if (!hasProductPermission) {
      if (onRequestAccess) onRequestAccess(product);
      return;
    }
    onLaunchDemo(product);
  };

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-sm">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white backdrop-blur-md shadow-sm">
                ★ {product.badge}
              </span>
            )}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-md">
            {product.version}
          </span>
        </div>

        {/* Access Status Overlay Tag */}
        <div className="absolute bottom-3 left-3">
          {canLaunch ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Launch
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow">
              <Clock className="w-3.5 h-3.5" /> Demo Expired
            </span>
          ) : !hasProductPermission && isAuthenticated ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/90 text-slate-950 backdrop-blur-md shadow">
              <Lock className="w-3.5 h-3.5" /> Permission Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 backdrop-blur-md">
              <Lock className="w-3.5 h-3.5" /> Client Login Required
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">
              {product.title}
            </h3>
            {product.price && (
              <span className="font-extrabold text-xs px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono shrink-0">
                {product.price}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Feature Highlights Pills */}
          <div className="mt-3.5 space-y-1.5">
            {product.features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {/* Main Launch / Request / Login Button */}
          {canLaunch ? (
            <button
              onClick={handleLaunchClick}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Demo
            </button>
          ) : isExpired ? (
            <button
              onClick={handleLaunchClick}
              className="flex-1 py-2 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Request Extra Time
            </button>
          ) : !hasProductPermission && isAuthenticated ? (
            <button
              onClick={handleLaunchClick}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Request Access
            </button>
          ) : (
            <button
              onClick={handleLaunchClick}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              Login to Demo
            </button>
          )}

          {/* Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Inspect Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Direct Etsy Listing link if present */}
          {product.purchaseUrl && (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition"
              title="Buy Full Version on Etsy"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
