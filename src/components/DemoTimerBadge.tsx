import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DemoTimerBadgeProps {
  onExtendClick?: () => void;
  compact?: boolean;
}

export const DemoTimerBadge: React.FC<DemoTimerBadgeProps> = ({ onExtendClick, compact = false }) => {
  const { currentSession, remainingSeconds, isClient } = useAuth();

  if (!isClient || !currentSession) return null;

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isWarning = remainingSeconds > 0 && remainingSeconds <= 300; // < 5 mins
  const isCritical = remainingSeconds > 0 && remainingSeconds <= 60; // < 1 min
  const isExpired = currentSession.status === 'expired' || (currentSession.status === 'active' && remainingSeconds <= 0);
  const isPaused = currentSession.status === 'paused';
  const isIdle = currentSession.status === 'idle';

  let badgeColor = 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300';
  let dotColor = 'bg-indigo-500';

  if (isExpired) {
    badgeColor = 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300';
    dotColor = 'bg-rose-500';
  } else if (isPaused) {
    badgeColor = 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
    dotColor = 'bg-amber-500';
  } else if (isCritical) {
    badgeColor = 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300';
    dotColor = 'bg-rose-600';
  } else if (isWarning) {
    badgeColor = 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
    dotColor = 'bg-amber-500';
  } else if (isIdle) {
    badgeColor = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
    dotColor = 'bg-emerald-500';
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor} ${!isExpired && !isIdle && !isPaused ? 'animate-ping' : ''}`} />
        {isExpired ? 'Expired' : isPaused ? `Paused ${timeFormatted}` : isIdle ? `${currentSession.durationMinutes}m Ready` : timeFormatted}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-sm transition-all ${badgeColor}`}>
      <span className="relative flex h-2.5 w-2.5">
        {!isExpired && !isPaused && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>

      <div className="flex items-center gap-1.5 font-mono">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-bold">
          {isExpired ? 'DEMO EXPIRED' : isPaused ? `PAUSED: ${timeFormatted}` : isIdle ? `${currentSession.durationMinutes}m Ready` : timeFormatted}
        </span>
      </div>

      {isWarning && !isExpired && (
        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
          <AlertTriangle className="w-3 h-3" /> Low Time
        </span>
      )}

      {onExtendClick && (
        <button
          onClick={onExtendClick}
          className="ml-1 text-[11px] underline font-semibold hover:opacity-80 transition"
        >
          {isExpired ? 'Request Time' : '+ Add Time'}
        </button>
      )}
    </div>
  );
};
