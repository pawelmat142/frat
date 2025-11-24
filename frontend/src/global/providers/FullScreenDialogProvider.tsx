import Header from 'global/components/Header';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
  useCallback
} from 'react';

interface FullScreenDialogContextType {
  open<T>(config: FullScreenDialogConfig<T>): Promise<T | null | undefined>;
  close: <T>(result?: T | null) => void;
}

interface FullScreenDialogConfig<T = any> {
  children: ReactNode;
  title?: string;
  // optional callback fired before promise resolution
  onSubmit?: (result?: T | null) => void;
  // behavior flags (extend later as needed)
  closeOnEsc?: boolean;
  backdropDisabled?: boolean; // if true backdrop click does NOT close
}

const FullScreenDialogContext = createContext<FullScreenDialogContextType | undefined>(undefined);

export const useFullScreenDialog = () => {
  const ctx = useContext(FullScreenDialogContext);
  if (!ctx) throw new Error('useFullScreenDialog must be used within FullScreenDialogProvider');
  return ctx;
};

export const FullScreenDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    open: boolean;
    config: FullScreenDialogConfig<any>;
  }>({ open: false, config: { children: null } });

  const resolveRef = useRef<(value: any) => void>();
  const historyPushedRef = useRef(false);

  const cleanupHistoryListener = useRef<() => void>(() => {});

  const handleClose = useCallback(<T,>(result?: T | null) => {
    // if (!state.open) return;
    state.config?.onSubmit?.(result);
    // resolve promise
    resolveRef.current?.(result as T | null | undefined);
    resolveRef.current = undefined;
    setState(prev => ({ ...prev, open: false }));
  }, [state]);

  const open = useCallback(<T,>(config: FullScreenDialogConfig<T>) => {
    // prevent opening another while one is active
    if (state.open) {
      return Promise.reject(new Error('FullScreenDialog already open'));
    }
    return new Promise<T | null | undefined>((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, config });
    });
  }, [state.open]);

  // Manage browser back navigation (hardware back on mobile) so it closes dialog instead of navigating away
  useEffect(() => {
    if (state.open && !historyPushedRef.current) {
      // push a dummy history state – same URL so route doesn't change
      try {
        window.history.pushState({ fsdialog: true }, '', window.location.href);
        historyPushedRef.current = true;
      } catch (e) {/* ignore */}
      const onPopState = (ev: PopStateEvent) => {
        if (historyPushedRef.current) {
          // close dialog and re-push original state so underlying component remains
          handleClose(null);
          historyPushedRef.current = false;
        }
      };
      window.addEventListener('popstate', onPopState);
      cleanupHistoryListener.current = () => {
        window.removeEventListener('popstate', onPopState);
      };
    }
    if (!state.open && historyPushedRef.current) {
      // dialog closed -> replace state to avoid stacking
      try {
        window.history.replaceState({}, '', window.location.href);
      } catch (e) {/* ignore */}
      historyPushedRef.current = false;
      cleanupHistoryListener.current();
    }
    return () => {
      if (!state.open) cleanupHistoryListener.current();
    };
  }, [state.open, handleClose]);

  const contextValue: FullScreenDialogContextType = {
    open,
    close: (result?: any) => handleClose(result)
  };

  return (
    <FullScreenDialogContext.Provider value={contextValue}>
      {children}
      <FullScreenDialog
        open={state.open}
        config={state.config}
        onClose={handleClose}
      />
    </FullScreenDialogContext.Provider>
  );
};

interface FullScreenDialogProps {
  open: boolean;
  config: FullScreenDialogConfig<any>;
  className?: string;
  onClose: <T>(result?: T | null) => void;
}

const ANIMATION_MS = 200; // keep numeric for JS timers; Tailwind uses fixed classes

const FullScreenDialog: React.FC<FullScreenDialogProps> = ({ open, onClose, config, className }) => {
  const [visible, setVisible] = useState(open);
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  // mount / unmount management + animation
  useEffect(() => {
    if (open) {
      setVisible(true);
      // next tick for CSS transition
      requestAnimationFrame(() => setShow(true));
      // lock body scroll
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      setClosing(true);
      setShow(false);
      const timeout = setTimeout(() => {
        setClosing(false);
        setVisible(false);
        document.body.style.overflow = '';
      }, ANIMATION_MS);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [open, visible]);

  // Esc key handling
  useEffect(() => {
    if (!open) return;
    if (config.closeOnEsc === false) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, config.closeOnEsc, onClose]);

  if (!visible) return null;

  const overlayClass = `popup fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 transition-opacity duration-200 ${show && !closing ? 'opacity-100' : 'opacity-0'}`;

  const handleBackdropClick = () => {
    if (config.backdropDisabled) return;
    onClose(null);
  };

  return (
    <div className={overlayClass} onClick={handleBackdropClick}>
      <div
        className={`${className} primary-bg w-full h-full max-w-full max-h-full transform transition-all duration-200 will-change-transform will-change-opacity ${show && !closing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} popup-content overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <Header onBack={() => onClose(null)} title={config?.title} hideMenu={true} />
        {config?.children}
      </div>
    </div>
  );
};
