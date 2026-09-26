import React, { useState, useEffect, useRef } from 'react';
import { Product, DemoSession } from '../types';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services/sessionService';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Trash2, 
  ShoppingBag, 
  AlertCircle, 
  X, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface HtmlDemoViewerProps {
  product: Product;
  onClose: () => void;
  onOpenReportIssue?: () => void;
  onSessionExpired: () => void;
}

export const HtmlDemoViewer: React.FC<HtmlDemoViewerProps> = ({
  product,
  onClose,
  onOpenReportIssue,
  onSessionExpired
}) => {
  const { 
    currentSession, 
    remainingSeconds, 
    clientProfile, 
    isClient, 
    setIsDemoOpen,
    activateDemoSession,
    resumeActiveUseSession,
    pauseActiveSession
  } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-start or resume demo session on viewer mount, and pause when closing in active_use mode
  useEffect(() => {
    setIsDemoOpen(true);
    if (isClient && clientProfile) {
      if (!currentSession || currentSession.status === 'idle') {
        activateDemoSession(product.id, product.title);
      } else if (currentSession.status === 'paused' || currentSession.isAutoPaused) {
        resumeActiveUseSession();
      }
    }
    return () => {
      setIsDemoOpen(false);
      if (isClient && clientProfile && (clientProfile.timerMode === 'active_use' || currentSession?.timerMode === 'active_use')) {
        pauseActiveSession();
      }
    };
  }, [isClient, clientProfile?.uid, currentSession?.status, currentSession?.isAutoPaused, currentSession?.timerMode, setIsDemoOpen, product.id, product.title]);

  // Check if session has expired
  useEffect(() => {
    if (isClient && currentSession) {
      if (currentSession.status === 'expired' || currentSession.status === 'revoked' || (currentSession.status === 'active' && remainingSeconds <= 0)) {
        onSessionExpired();
      }
    }
  }, [remainingSeconds, currentSession, isClient, onSessionExpired]);

  // Periodic heartbeat sync to Firestore while demo is active
  useEffect(() => {
    if (!clientProfile) return;
    const interval = setInterval(() => {
      sessionService.updateHeartbeat(clientProfile.uid, product.id, product.title);
    }, 25000); // 25s
    return () => clearInterval(interval);
  }, [clientProfile, product]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleResetDemoStorage = () => {
    if (confirm(`Clear client sandboxed demo data for "${product.title}"? This resets demo inputs to initial state.`)) {
      const prefix = `wc_demo_${clientProfile?.uid || 'guest'}_${product.id}_`;
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      setIframeKey(prev => prev + 1);
    }
  };

  // Build the sandboxed HTML payload with client isolation shim
  const clientId = clientProfile?.uid || 'guest';
  const isolationScript = `
    <script>
      (function() {
        const PREFIX = 'wc_demo_${clientId}_${product.id}_';
        const origGet = localStorage.getItem.bind(localStorage);
        const origSet = localStorage.setItem.bind(localStorage);
        const origRemove = localStorage.removeItem.bind(localStorage);
        const origClear = localStorage.clear.bind(localStorage);

        localStorage.getItem = function(key) {
          return origGet(PREFIX + key);
        };
        localStorage.setItem = function(key, val) {
          return origSet(PREFIX + key, val);
        };
        localStorage.removeItem = function(key) {
          return origRemove(PREFIX + key);
        };
      })();
    </script>
  `;

  // Inject isolation script right after <head> or at beginning
  let securedHtml = product.demoHtml || '<h1>No Demo Available</h1>';
  if (securedHtml.includes('<head>')) {
    securedHtml = securedHtml.replace('<head>', '<head>' + isolationScript);
  } else {
    securedHtml = isolationScript + securedHtml;
  }

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = remainingSeconds > 0 && remainingSeconds <= 300;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200"
    >
      {/* Top Application Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shadow-md select-none shrink-0">
        
        {/* Left: Product Info & Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to Catalog"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {product.version}
              </span>
              <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {product.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sandboxed Client Origin • Isolated LocalStorage
            </p>
          </div>
        </div>

        {/* Center: Authoritative Live Countdown Timer */}
        {isClient && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-mono font-bold shadow-inner ${
              isLowTime
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-800/90 border-slate-700 text-emerald-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{timeFormatted}</span>
              <span className="hidden md:inline text-[10px] text-slate-400 font-sans font-normal">
                Remaining
              </span>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh demo */}
          <button
            onClick={handleRefresh}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
            title="Reload Demo Application"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Reset storage */}
          <button
            onClick={handleResetDemoStorage}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
            title="Reset sandbox demo inputs"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Reset Data</span>
          </button>

          {/* Report issue */}
          {onOpenReportIssue && (
            <button
              onClick={onOpenReportIssue}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-1.5"
              title="Report an issue with this tool"
            >
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">Report Issue</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Etsy Purchase Button */}
          {product.purchaseUrl && (
            <a
              href={product.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buy Full Version</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {/* Exit */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition ml-1"
          >
            Close Demo
          </button>
        </div>
      </header>

      {/* Sandboxed HTML Application Iframe Container */}
      <div className="flex-1 w-full h-full bg-slate-900 relative">
        <iframe
          key={iframeKey}
          title={product.title}
          srcDoc={securedHtml}
          sandbox="allow-scripts allow-forms allow-modals allow-downloads allow-popups"
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
};
