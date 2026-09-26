import React, { useState, useEffect } from 'react';
import { ClientProfile, Product } from '../types';
import { ClientProductAccessSelector } from './ClientProductAccessSelector';
import { clientService } from '../services/clientService';
import { logService } from '../services/logService';
import { useAuth } from '../context/AuthContext';
import { X, Sliders, Check, Sparkles } from 'lucide-react';

interface ClientProductAccessModalProps {
  isOpen: boolean;
  client: ClientProfile | null;
  products: Product[];
  onClose: () => void;
}

export const ClientProductAccessModal: React.FC<ClientProductAccessModalProps> = ({
  isOpen,
  client,
  products,
  onClose
}) => {
  const { currentUser } = useAuth();
  const [allowedProductIds, setAllowedProductIds] = useState<string[]>(['*']);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      setAllowedProductIds(client.allowedProductIds || ['*']);
      setSuccessMsg(false);
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await clientService.updateClientAllowedProducts(client.uid, allowedProductIds);
      logService.recordLog(
        currentUser?.uid || 'admin',
        currentUser?.email || 'admin',
        'admin',
        'update_product_access',
        `Customized product permissions for ${client.fullName}: ${allowedProductIds.includes('*') ? 'Whole Catalog' : `${allowedProductIds.length} tools allowed`}`
      );
      setSuccessMsg(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to update product permissions');
    } finally {
      setIsSaving(false);
    }
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
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Digital Products Access Studio
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {client.fullName} ({client.email})
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

        {/* Product Access Selector */}
        <ClientProductAccessSelector
          products={products}
          allowedProductIds={allowedProductIds}
          onChange={setAllowedProductIds}
        />

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Product permissions updated in Cloud Firestore!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <span>Saving...</span> : <span>Apply Permissions</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
