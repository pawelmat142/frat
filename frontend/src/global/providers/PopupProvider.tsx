import { DateRange } from '@shared/interfaces/EmployeeProfileI';
import CloseBtn from 'global/components/CloseBtn';
import Button from 'global/components/controls/Button';
import { BtnMode, BtnModes } from 'global/interface/controls.interface';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheetContextType } from './BottomSheetProvider';

interface PopupContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  popup: (config: PopupConfig) => Promise<boolean>;
  close: () => void;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface CallendarsViewProps {
  range?: DateRange | null;
  onSubmit?: (result?: DateRange) => void;
  onCancel?: () => void;
  selectorMode?: boolean;
  bottomSheetCtx?: BottomSheetContextType;
}

export interface PopupConfig {
  title?: string
  message?: string
  buttons?: PopupButtonConfig[]
  children?: ReactNode
  showClose?: boolean
  popupClassName?: string
}
export type PopupHandler = (options: PopupConfig) => Promise<boolean>;

interface PopupButtonConfig {
  text: string;
  mode?: BtnMode;
  action?: () => boolean | Promise<boolean>;
  showClose?: boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const useConfirm = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('useConfirm must be used within PopupProvider');
  return ctx.confirm;
};

export const usePopup = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used within PopupProvider');
  return ctx;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [state, setState] = useState<{
    open: boolean;
    config: PopupConfig;
    resolve?: (result: boolean) => void;
  }>({ open: false, config: { message: '', buttons: [] } });

  const confirm = (options: ConfirmOptions) => {
    return popup({
      popupClassName: 'pp-confirm-popup',
      title: options.title,
      message: options.message,
      buttons: [{
        text: options.cancelText || 'Anuluj',
        mode: BtnModes.ERROR_TXT,
        action: () => false
      }, {
        text: options.confirmText || 'Potwierdź',
        mode: BtnModes.PRIMARY,
        action: () => true
      }]
    })
  };

  const popup = (config: PopupConfig) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, config, resolve });
    })
  }

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ ...state, open: false, resolve: undefined });
  };

  return (
    <PopupContext.Provider value={{ confirm, popup, close: () => handleClose(false) }}>
      {children}
      <PopupDialog
        open={state.open}
        config={state.config}
        onClose={handleClose}
        className={state.config.popupClassName}

      />
    </PopupContext.Provider>
  );
};

interface PopupDialogProps {
  open: boolean;
  config: PopupConfig;
  className?: string;
  onClose: (result: boolean) => void;
}

const PopupDialog: React.FC<PopupDialogProps> = ({ open, onClose, config, className }) => {

  const [visible, setVisible] = React.useState(open);
  const [show, setShow] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const historyInjectedRef = React.useRef(false);

  // Stable popstate handler
  const popHandlerRef = React.useRef<(e: PopStateEvent) => void>();
  if (!popHandlerRef.current) {
    popHandlerRef.current = () => {
      // User pressed back -> close popup
      onClose(false);
      historyInjectedRef.current = false; // consumed
    };
  }

  React.useEffect(() => {
    if (open && !historyInjectedRef.current) {
      try {
        window.history.pushState({ popup: true }, '', window.location.href);
        historyInjectedRef.current = true;
      } catch { /* ignore */ }
      window.addEventListener('popstate', popHandlerRef.current!);
    }
    return () => {
      // Cleanup listener when component unmounts or open changes
      window.removeEventListener('popstate', popHandlerRef.current!);
    };
  }, [open, onClose]);

  const { t } = useTranslation();

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      setTimeout(() => setShow(true), 10);
    } else if (visible) {
      setShow(false);
      setClosing(true);
      const timeout = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        // Remove artificial history entry if it still exists (closed programmatically)
        if (historyInjectedRef.current) {
          try {
            window.history.back();
          } catch { /* ignore */ }
          historyInjectedRef.current = false;
        }
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open, visible]);

  if (!visible) return null;

  const btnAction = (btn: PopupButtonConfig) => {
    setShow(false);
    setClosing(true);

    if (btn.action) {
      const result = btn.action();
      if (result instanceof Promise) {
        result.then(res => onClose(res));
      } else {
        setTimeout(() => onClose(result), 200);
      }
    } else {
      setTimeout(() => onClose(false), 200);
    }
  }

  const overlayClass = `popup fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 ${show && !closing ? 'opacity-100' : 'opacity-0'}`;
  return (
    <div className={overlayClass}>
      <div
        className={`${className} primary-bg rounded-lg shadow-lg pt-4 min-w-[300px] transform transition-all duration-200 ${show && !closing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} popup-content`}
      >

        <div className="popup-header flex items-start justify-between mb-5 gap-2">
          {config?.title && <h2 className="text-lg font-semibold ">{t(config.title)}</h2>}
          {config?.showClose && (<CloseBtn size={24} onClick={() => {
            onClose(false)
          }} />)}
        </div>

        {config?.children ? (
          config.children
        ) : (
          <>
            <div className="mb-6">{t(config?.message)}</div>
            <div className="flex justify-end gap-2">

              {config?.buttons?.map((btn, idx) => (
                <Button key={idx} mode={btn.mode} onClick={() => btnAction(btn)}>
                  {t(btn.text)}
                </Button>
              ))}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
