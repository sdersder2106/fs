'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId = { ...newToast, id };
    
    setToasts((prev) => [...prev, toastWithId]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  const { toasts, dismiss } = context;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const icons = {
    default: <Info className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    destructive: <AlertCircle className="h-5 w-5" />,
  };

  const styles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
  };

  const iconStyles = {
    default: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500',
  };

  const variant = toast.variant || 'default';

  return (
    <div
      className={cn(
        'w-96 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5',
        styles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0', iconStyles[variant])}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{toast.title}</h4>
          {toast.description && (
            <p className="mt-1 text-sm opacity-90">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline-offset-4 hover:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Export a singleton toast function for use outside of React components
let globalToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function setGlobalToast(toastFn: (toast: Omit<Toast, 'id'>) => void) {
  globalToast = toastFn;
}

export function toast(options: Omit<Toast, 'id'>) {
  if (globalToast) {
    globalToast(options);
  } else {
    console.warn('Toast called before ToastProvider was mounted');
  }
}