import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  Radio, 
  Database, 
  FileText, 
  Activity,
  UserX,
  ShieldCheck
} from 'lucide-react';

interface ClientDeleteModalProps {
  isOpen: boolean;
  client: ClientProfile | null;
  onClose: () => void;
  onConfirm: (options: {
    softDelete: boolean;
    deleteSession: boolean;
    deleteRequests: boolean;
    recordAudit: boolean;
    reason: string;
  }) => Promise<void>;
  isDeleting: boolean;
}

export const ClientDeleteModal: React.FC<ClientDeleteModalProps> = ({
  isOpen,
  client,
  onClose,
  onConfirm,
  isDeleting
}) => {
  const [deleteMode, setDeleteMode] = useState<'hard' | 'soft'>('hard');
  const [deleteSession, setDeleteSession] = useState(true);
  const [deleteRequests, setDeleteRequests] = useState(true);
  const [recordAudit, setRecordAudit] = useState(true);
  const [reason, setReason] = useState('');

  if (!isOpen || !client) return null;

  const isMasterAdmin = client.uid === 'admin_karim' || client.role === 'admin' || client.email.toLowerCase().includes('karim');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMasterAdmin) return;

    await onConfirm({
      softDelete: deleteMode === 'soft',
      deleteSession,
      deleteRequests,
      recordAudit,
      reason: reason.trim() || (deleteMode === 'soft' ? 'Account access revoked by administrator' : 'Account permanently purged from Firestore')
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isMasterAdmin ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
            }`}>
              {isMasterAdmin ? <ShieldCheck className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {isMasterAdmin ? 'Protected Administrator Account' : 'Client Deletion & Cleanup Studio'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure deletion mode, session cascading, and audit records in Cloud Firestore.
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

        {/* Master Admin Protection Guard */}
        {isMasterAdmin ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Deletion Guard Active</span>
            </div>
            <p className="leading-relaxed">
              The Master Administrator account (<strong>{client.email}</strong>) is permanently protected by system security rules and cannot be deleted or revoked.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Close Dialog
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Target Client Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {client.fullName}
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {client.email}
                </div>
                {client.organization && (
                  <div className="text-[11px] text-indigo-500 mt-0.5">
                    {client.organization}
                  </div>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                client.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {client.status}
              </span>
            </div>

            {/* Deletion Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Choose Deletion Policy
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div 
                  onClick={() => setDeleteMode('hard')}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    deleteMode === 'hard'
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Permanent Purge
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Completely deletes profile and credentials from Firestore <code className="font-mono text-rose-600">/clients/{'{uid}'}</code>.
                  </p>
                </div>

                <div 
                  onClick={() => setDeleteMode('soft')}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    deleteMode === 'soft'
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Revoke & Deactivate
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Marks status as 'revoked' and blocks login while keeping profile record in Firestore for audit.
                  </p>
                </div>
              </div>
            </div>

            {/* Cascade Cleanup Checkboxes */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Cascade Cleanup Customizations
              </label>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteSession}
                    onChange={(e) => setDeleteSession(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-500" />
                      Clean Up Live Demo Session Document
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Removes <code className="font-mono text-slate-500">/demoSessions/{client.uid}</code> so no orphaned sessions remain.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteRequests}
                    onChange={(e) => setDeleteRequests(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-500" />
                      Clean Up Access & Extension Requests
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Deletes all pending and historic access request tickets submitted by this client.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordAudit}
                    onChange={(e) => setRecordAudit(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      Record Event in Security Audit Log
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Adds authoritative security audit entry to <code className="font-mono text-slate-500">/activityLogs</code> with administrator timestamp.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Optional Reason / Notes */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Deletion Reason / Administrative Note (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Evaluation period completed, client requested purge..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm ${
                  deleteMode === 'hard'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                } disabled:opacity-50`}
              >
                {isDeleting ? (
                  <span>Executing...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleteMode === 'hard' ? 'Confirm Permanent Purge' : 'Revoke Client Access'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
