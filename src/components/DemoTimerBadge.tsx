import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, AlertTriangle, Pause, Calendar, Activity, Play } from 'lucide-react';

interface DemoTimerBadgeProps {
  onExtendClick?: () => void;
  compact?: boolean;
}

export const DemoTimerBadge: React.FC<DemoTimerBadgeProps> = ({ onExtendClick, compact = false }) => {
  const { 
    currentSession, 
    clientProfile, 
    remainingSeconds, 
    isClient, 
    isAutoPaused, 
    isDemoOpen,
    resumeActiveUseSession 
  } = useAuth();

  if (!isClient || !clientProfile) return null;

  const effectiveMode = clientProfile?.timerMode || currentSession?.timerMode || 'continuous';

  // Calculate formatted time components
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  let timeFormatted = '';
  if (effectiveMode === 'scheduled' && days > 0) {
    timeFormatted = `${days}d ${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else if (hours > 0) {
    timeFormatted = `${hours}h ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const isExpired = currentSession?.status === 'expired' || 
    (currentSession?.status === 'active' && remainingSeconds <= 0);
  const isManuallyPaused = currentSession?.status === 'paused';
  const isIdle = !currentSession || currentSession.status === 'idle';
  const isDemoClosedPaused = effectiveMode === 'active_use' && (!isDemoOpen || !currentSession?.isDemoOpen) && !isIdle && !isExpired;

  const isWarning = !isIdle && remainingSeconds > 0 && remainingSeconds <= 300; // < 5 mins
  const isCritical = !isIdle && remainingSeconds > 0 && remainingSeconds <= 60; // < 1 min

  let badgeColor = 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300';
  let dotColor = 'bg-indigo-500';

  if (isExpired) {
    badgeColor = 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300';
    dotColor = 'bg-rose-500';
  } else if (isDemoClosedPaused) {
    badgeColor = 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200';
    dotColor = 'bg-amber-500';
  } else if (isAutoPaused) {
    badgeColor = 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200';
    dotColor = 'bg-amber-500';
  } else if (isManuallyPaused) {
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

  // Policy icon indicator
  const getPolicyIcon = () => {
    if (effectiveMode === 'scheduled') return <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    if (effectiveMode === 'active_use') return <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
    return <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  };

  const isPausedState = isManuallyPaused || isAutoPaused || isDemoClosedPaused;

  const policyLabel = effectiveMode === 'active_use'
    ? 'Active Use Tracking (Pauses when idle/closed)'
    : effectiveMode === 'scheduled'
      ? 'Scheduled Fixed Calendar Expiration'
      : 'Continuous Real-Time Countdown';

  if (compact) {
    return (
      <div 
        title={`${policyLabel} • Allowed Timing: ${timeFormatted}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor} ${!isExpired && !isIdle && !isPausedState ? 'animate-ping' : ''}`} />
        {isExpired 
          ? 'Expired' 
          : isDemoClosedPaused
            ? `Paused ${timeFormatted}`
            : isAutoPaused 
              ? `Idle ${timeFormatted}` 
              : isManuallyPaused 
                ? `Paused ${timeFormatted}` 
                : isIdle 
                  ? (effectiveMode === 'scheduled' ? `Scheduled ${timeFormatted}` : `Allowed: ${timeFormatted}`) 
                  : timeFormatted}
      </div>
    );
  }

  return (
    <div 
      title={`${policyLabel} • Allowed Time: ${timeFormatted}`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-sm transition-all ${badgeColor}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        {!isExpired && !isIdle && !isPausedState && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
      </span>

      <div className="flex items-center gap-1.5 font-mono">
        {getPolicyIcon()}
        <span className="font-bold">
          {isExpired 
            ? 'DEMO EXPIRED' 
            : isDemoClosedPaused
              ? `PAUSED (DEMO CLOSED): ${timeFormatted}`
              : isAutoPaused 
                ? `AUTO-PAUSED: ${timeFormatted}` 
                : isManuallyPaused 
                  ? `PAUSED: ${timeFormatted}` 
                  : isIdle 
                    ? (effectiveMode === 'scheduled' ? `Scheduled: ${timeFormatted}` : `Allowed: ${timeFormatted}`) 
                    : timeFormatted}
        </span>
      </div>

      {isAutoPaused && isDemoOpen && (
        <button
          type="button"
          onClick={resumeActiveUseSession}
          className="ml-0.5 px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
          title="Click to resume active evaluation timer"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>Resume</span>
        </button>
      )}

      {effectiveMode === 'active_use' && isDemoOpen && !isPausedState && !isIdle && !isExpired && (
        <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100/60 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded">
          In Use
        </span>
      )}

      {isDemoClosedPaused && (
        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
          Demo Closed
        </span>
      )}

      {isWarning && !isExpired && (
        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
          <AlertTriangle className="w-3 h-3" /> Low
        </span>
      )}

      {onExtendClick && (
        <button
          onClick={onExtendClick}
          className="ml-1 text-[11px] underline font-semibold hover:opacity-80 transition cursor-pointer"
        >
          {isExpired ? 'Request Time' : '+ Add Time'}
        </button>
      )}
    </div>
  );
};
