import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'info' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const snackbarTimeoutRef = useRef(null);

  const showAlert = useCallback((message, type = 'info') => {
    setDialog({ isOpen: true, message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.onConfirm) confirmState.onConfirm();
    closeConfirm();
  }, [confirmState, closeConfirm]);

  const showSnackbar = useCallback((message, type = 'success') => {
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbar({ isOpen: true, message, type });
    snackbarTimeoutRef.current = setTimeout(() => {
      setSnackbar(prev => ({ ...prev, isOpen: false }));
    }, 3000);
  }, []);

  const closeSnackbar = useCallback(() => {
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showSnackbar }}>
      {children}

      {/* Main Alert Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-center max-w-sm w-full relative">
             <div className="flex justify-center mb-4">
               {dialog.type === 'success' ? <CheckCircle2 className="text-emerald-400 w-12 h-12" /> : 
                dialog.type === 'error' ? <AlertCircle className="text-rose-400 w-12 h-12" /> :
                <Info className="text-blue-400 w-12 h-12" />}
             </div>
             <p className="text-base font-medium text-white mb-6 whitespace-pre-wrap">{dialog.message}</p>
             <button 
               onClick={closeAlert} 
               className="w-full py-2.5 bg-brandPrimary hover:bg-brandPrimary/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brandPrimary/20"
             >
               Okay
             </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-center max-w-sm w-full relative">
             <div className="flex justify-center mb-4">
               <AlertCircle className="text-amber-400 w-12 h-12" />
             </div>
             <h3 className="text-lg font-bold text-white mb-2">{confirmState.title}</h3>
             <p className="text-sm font-medium text-white/60 mb-6 whitespace-pre-wrap">{confirmState.message}</p>
             <div className="flex gap-3">
               <button 
                 onClick={closeConfirm} 
                 className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleConfirm} 
                 className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/20"
               >
                 Confirm
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Snackbar (Toast) */}
      {snackbar.isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-[#080b12] border border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-fade-in slide-in-from-right max-w-sm">
          {snackbar.type === 'success' ? <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" /> :
           snackbar.type === 'error' ? <AlertCircle className="text-rose-400 w-5 h-5 shrink-0" /> :
           <Info className="text-blue-400 w-5 h-5 shrink-0" />}
          <p className="text-xs font-semibold text-white truncate flex-1">{snackbar.message}</p>
          <button onClick={closeSnackbar} className="text-white/40 hover:text-white shrink-0 ml-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </AlertContext.Provider>
  );
};
