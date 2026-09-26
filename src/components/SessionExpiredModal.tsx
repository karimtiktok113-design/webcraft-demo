import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  ShoppingBag, 
  ArrowRight, 
  ExternalLink, 
  ShieldAlert, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestTime: () => void;
  productTitle?: string;
  purchaseUrl?: string;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onClose,
  onRequestTime,
  productTitle = 'WebCraft Goods Interactive Planner',
  purchaseUrl = 'https://www.etsy.com'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl p-6 sm:p-8 space-y-6 text-center"
      >
        {/* Warning Icon Banner */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded-full uppercase tracking-wider">
            Demo Allowance Concluded
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Demo Session Has Expired
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            The allotted demonstration window for <strong className="text-slate-700 dark:text-slate-200">{productTitle}</strong> has reached zero.
          </p>
        </div>

        {/* Feature Cards / Value Props */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Enjoying this digital tool? Get the permanent edition:
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <li className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Unlimited lifetime use without time restrictions</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Instant download with source HTML & printable templates</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Free lifetime version updates and Etsy store support</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {purchaseUrl && (
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Full Version on Etsy</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}

          <button
            onClick={() => {
              onClose();
              onRequestTime();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Request Extra Time</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          Return to Catalog Overview
        </button>
      </div>
    </div>
  );
};
