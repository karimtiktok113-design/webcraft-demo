import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { Product, RequestType } from '../types';
import { 
  X, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface RequestTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
}

export const RequestTimeModal: React.FC<RequestTimeModalProps> = ({
  isOpen,
  onClose,
  targetProduct
}) => {
  const { clientProfile } = useAuth();
  const [requestType, setRequestType] = useState<RequestType>(
    targetProduct ? 'product_access' : 'time_extension'
  );
  const [requestedMinutes, setRequestedMinutes] = useState<number>(30);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile) {
      setErrorMsg('You must be logged in to submit a request.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await requestService.submitRequest({
        clientId: clientProfile.uid,
        clientEmail: clientProfile.email,
        clientName: clientProfile.fullName,
        requestType,
        requestedMinutes: requestType === 'time_extension' ? requestedMinutes : undefined,
        productId: targetProduct?.id,
        productTitle: targetProduct?.title,
        message: message.trim() || `Client requested ${requestType === 'time_extension' ? `${requestedMinutes} additional minutes` : 'product access'} via portal.`
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Request Submitted to Admin
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your request was registered in the database. The administrator can grant instant access or time extensions.
            </p>
          </div>
        ) : (
          <>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Support & Extension
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {requestType === 'time_extension' ? 'Request Extra Demo Time' : 'Request Product Access'}
              </h2>
              {targetProduct && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  Regarding: {targetProduct.title}
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Request Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestType('time_extension')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      requestType === 'time_extension'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Extra Demo Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('product_access')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      requestType === 'product_access'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Unlock Product
                  </button>
                </div>
              </div>

              {/* Time Options if time_extension */}
              {requestType === 'time_extension' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Additional Allowance
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setRequestedMinutes(mins)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition text-center ${
                          requestedMinutes === mins
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        +{mins} Minutes
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason or Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Need more time to evaluate the daily schedule module with my team..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Transmitting to Admin...' : 'Submit Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
