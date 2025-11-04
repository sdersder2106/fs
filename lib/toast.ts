import { toast as sonnerToast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2 
} from 'lucide-react';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class Toast {
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <CheckCircle2 className="h-5 w-5" />,
      action: options?.action,
    });
  }

  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <XCircle className="h-5 w-5" />,
      action: options?.action,
    });
  }

  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <AlertCircle className="h-5 w-5" />,
      action: options?.action,
    });
  }

  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <Info className="h-5 w-5" />,
      action: options?.action,
    });
  }

  loading(message: string, options?: { description?: string }) {
    return sonnerToast.loading(message, {
      description: options?.description,
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) {
    return sonnerToast.promise(promise, messages);
  }

  // Custom notifications
  criticalFinding(title: string, findingId: string) {
    return this.error('Critical Finding Discovered', {
      description: title,
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => (window.location.href = `/findings/${findingId}`),
      },
    });
  }

  pentestCompleted(title: string, pentestId: string) {
    return this.success('Pentest Completed', {
      description: title,
      duration: 4000,
      action: {
        label: 'View Report',
        onClick: () => (window.location.href = `/pentests/${pentestId}`),
      },
    });
  }

  assignmentNotification(message: string, itemId: string, type: 'target' | 'pentest' | 'finding') {
    return this.info('New Assignment', {
      description: message,
      duration: 4000,
      action: {
        label: 'View',
        onClick: () => (window.location.href = `/${type}s/${itemId}`),
      },
    });
  }

  commentMention(author: string, findingId: string) {
    return this.info(`${author} mentioned you`, {
      description: 'in a comment',
      duration: 4000,
      action: {
        label: 'View',
        onClick: () => (window.location.href = `/findings/${findingId}`),
      },
    });
  }
}

export const toast = new Toast();
