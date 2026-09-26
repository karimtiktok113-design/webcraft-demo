import React, { useState, useEffect } from 'react';
import { ClientProfile, DemoSession, TimerMode } from '../types';
import { sessionService } from '../services/sessionService';
import { clientService } from '../services/clientService';
import { logService } from '../services/logService';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Check, 
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface ClientTimerControlModalProps {
  isOpen: boolean;
  client: ClientProfile | null;
  onClose: () => void;
}

export const ClientTimerControlModal: React.FC<ClientTimerControlModalProps> = ({
  isOpen,
  client,
  onClose
}) => {
  const { currentUser } = useAuth();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(15);
  const [baselineMinutes, setBaselineMinutes] = useState<number>(client?.demoDurationMinutes || 15);
  const [selectedTimerMode, setSelectedTimerMode] = useState<TimerMode>(client?.timerMode || 'continuous');
  const [scheduledDateStr, setScheduledDateStr] = useState<string>(() => {
    const ts = client?.accountExpiresAt || (Date.now() + 24 * 60 * 60 * 1000);
    return new Date(ts).toISOString().slice(0, 16);
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Subscribe to real-time session for this client
  useEffect(() => {
    if (!client || !isOpen) return;

    setBaselineMinutes(client.demoDurationMinutes || 15);
    setSelectedTimerMode(client.timerMode || 'continuous');
    if (client.accountExpiresAt) {
      setScheduledDateStr(new Date(client.accountExpiresAt).toISOString().slice(0, 16));
    }

    const unsub = sessionService.subscribeSession(client.uid, (sess) => {
      setSession(sess);
      if (sess?.scheduledExpiresAt) {
        setScheduledDateStr(new Date(sess.scheduledExpiresAt).toISOString().slice(0, 16));
      }
    });

    return () => unsub();
  }, [client, isOpen]);

  // Real-time interval for timer display
  useEffect(() => {
    if (!session || !isOpen) return;

    const tick = () => {
      const sec = sessionService.calculateRemainingSeconds(session, client, session.isDemoOpen);
      setRemainingSeconds(sec);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, client, isOpen]);

  if (!isOpen || !client) return null;

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdjustTime = async (minutes: number) => {
    setIsProcessing(true);
    try {
      await sessionService.extendSessionTime(client.uid, minutes);
      logService.recordLog(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin',
        'admin',
        'timer_adjust',
        `Adjusted session time by ${minutes > 0 ? `+${minutes}` : minutes}m for client ${client.fullName}`
      );
      showFeedbackMsg(`Adjusted session time by ${minutes > 0 ? `+${minutes}` : minutes}m`);
    } catch (err: any) {
      showFeedbackMsg('Failed to adjust time');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetExactRemaining = async () => {
    if (customMinutes <= 0) return;
    setIsProcessing(true);
    try {
      await sessionService.setRemainingTime(client.uid, customMinutes);
      logService.recordLog(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin',
        'admin',
        'timer_set_exact',
        `Set exact remaining countdown to ${customMinutes}m for client ${client.fullName}`
      );
      showFeedbackMsg(`Remaining countdown set to ${customMinutes} minutes`);
    } catch (err: any) {
      showFeedbackMsg('Failed to set time');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePause = async () => {
    setIsProcessing(true);
    try {
      if (session?.status === 'paused') {
        await sessionService.resumeSession(client.uid);
        showFeedbackMsg('Session timer resumed');
      } else {
        await sessionService.pauseSession(client.uid);
        showFeedbackMsg('Session timer paused');
      }
    } catch (err) {
      showFeedbackMsg('Failed to toggle pause');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      const targetExpiresAt = selectedTimerMode === 'scheduled' 
        ? (new Date(scheduledDateStr).getTime() || (Date.now() + 24 * 3600 * 1000))
        : null;
      await sessionService.resetSession(client.uid, baselineMinutes, selectedTimerMode, targetExpiresAt);
      showFeedbackMsg(`Reset session to idle (${baselineMinutes}m baseline • ${selectedTimerMode})`);
    } catch (err) {
      showFeedbackMsg('Failed to reset session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceExpire = async () => {
    setIsProcessing(true);
    try {
      await sessionService.markExpired(client.uid);
      showFeedbackMsg('Demo session marked as expired');
    } catch (err) {
      showFeedbackMsg('Failed to expire session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBaselineDuration = async () => {
    setIsProcessing(true);
    try {
      let targetExpiresAt: number | null = null;
      if (selectedTimerMode === 'scheduled') {
        targetExpiresAt = new Date(scheduledDateStr).getTime() || (Date.now() + 24 * 3600 * 1000);
      }
      await clientService.updateClientTimer(client.uid, Number(baselineMinutes), selectedTimerMode, targetExpiresAt);
      showFeedbackMsg(`Saved policy: ${baselineMinutes}m • ${selectedTimerMode}${targetExpiresAt ? ` (Expires ${new Date(targetExpiresAt).toLocaleDateString()})` : ''}`);
    } catch (err) {
      showFeedbackMsg('Failed to save policy');
    } finally {
      setIsProcessing(false);
    }
  };

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isPaused = session?.status === 'paused';
  const isActive = session?.status === 'active';
  const isIdle = session?.status === 'idle' || !session;
  const isExpired = session?.status === 'expired';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Timer Customization Studio
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {client.fullName} • {client.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Timer Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Live Session Countdown
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isActive 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : isPaused
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : isExpired
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
            }`}>
              {session?.status || 'idle'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isExpired ? '00:00:00 (Expired)' : isIdle ? `${baselineMinutes}m (Ready)` : timeFormatted}
            </div>
            <div className="text-right text-xs text-slate-400">
              Allocated: <span className="font-bold text-slate-700 dark:text-slate-300">{baselineMinutes}m</span>
            </div>
          </div>

          {feedback && (
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold text-center animate-in fade-in">
              {feedback}
            </div>
          )}
        </div>

        {/* Quick Time Extension Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Time Adjustments (Real-Time Firestore Update)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 15, 30, 60].map((m) => (
              <button
                key={m}
                type="button"
                disabled={isProcessing}
                onClick={() => handleAdjustTime(m)}
                className="py-2 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>{m}m</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={isProcessing || remainingSeconds <= 300}
              onClick={() => handleAdjustTime(-5)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Minus className="w-3 h-3" />
              <span>Reduce -5m</span>
            </button>
            <button
              type="button"
              disabled={isProcessing || remainingSeconds <= 900}
              onClick={() => handleAdjustTime(-15)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Minus className="w-3 h-3" />
              <span>Reduce -15m</span>
            </button>
          </div>
        </div>

        {/* Set Exact Remaining Countdown */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Set Exact Remaining Countdown
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                max={1440}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="w-full pl-3 pr-12 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                mins
              </span>
            </div>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSetExactRemaining}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Apply Exact Time
            </button>
          </div>
        </div>

        {/* Live Controls: Pause/Resume, Reset, Force Expire */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isProcessing || isIdle || isExpired}
            onClick={handleTogglePause}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
              isPaused 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleReset}
            className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            disabled={isProcessing || isExpired}
            onClick={handleForceExpire}
            className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Expire Now</span>
          </button>
        </div>

        {/* Baseline Duration Configuration */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 rounded-2xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Default Account Baseline Duration
              </span>
              <p className="text-[11px] text-slate-400">
                Applied when resetting session or upon fresh evaluation launch.
              </p>
            </div>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSaveBaselineDuration}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Save Policy
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Baseline Minutes</label>
              <select
                value={baselineMinutes}
                onChange={(e) => setBaselineMinutes(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Standard)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
                <option value={240}>240 Minutes (4 Hours)</option>
                <option value={1440}>1440 Minutes (24 Hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Timer Policy Mode</label>
              <select
                value={selectedTimerMode}
                onChange={(e) => setSelectedTimerMode(e.target.value as TimerMode)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="continuous">Continuous Countdown</option>
                <option value="active_use">Active Use Tracking</option>
                <option value="scheduled">Scheduled Expiry</option>
              </select>
            </div>
          </div>

          {/* Mode Descriptions */}
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
            {selectedTimerMode === 'continuous' && (
              <p>⏱ <strong>Continuous Countdown:</strong> Timer runs uninterrupted in real time from launch until expiration, even if browser is closed or idle.</p>
            )}
            {selectedTimerMode === 'active_use' && (
              <p>⚡ <strong>Active Use Tracking:</strong> Timer counts down only while the client is active on the site. Auto-pauses if idle for 60s or tab is hidden.</p>
            )}
            {selectedTimerMode === 'scheduled' && (
              <p>📅 <strong>Scheduled Expiry:</strong> Fixed calendar window access. Client can evaluate until the scheduled target date and time arrives.</p>
            )}
          </div>

          {/* Scheduled Date/Time Picker */}
          {selectedTimerMode === 'scheduled' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Fixed Scheduled Expiration Date & Time
                </label>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                  {scheduledDateStr ? new Date(scheduledDateStr).toLocaleString() : ''}
                </span>
              </div>
              <input
                type="datetime-local"
                value={scheduledDateStr}
                onChange={(e) => setScheduledDateStr(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                {[
                  { label: '+24 Hours', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 },
                  { label: '+30 Days', hours: 720 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + preset.hours * 3600 * 1000);
                      setScheduledDateStr(d.toISOString().slice(0, 16));
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
