import Buton from 'global/components/controls/Buton';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve?: (result: boolean) => void;
  }>({ open: false, options: { message: '' } });

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ ...state, open: false, resolve: undefined });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={state.open}
        options={state.options}
        onClose={handleClose}
      />
    </ConfirmContext.Provider>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  options: ConfirmOptions;
  onClose: (result: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, options, onClose }) => {
  const [visible, setVisible] = React.useState(open)
  const [show, setShow] = React.useState(false)
  const [closing, setClosing] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      setTimeout(() => setShow(true), 10)
    } else if (visible) {
      setShow(false)
      setClosing(true)
      const timeout = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, 200)
      return () => clearTimeout(timeout);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <div className={`popup fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 ${show && !closing ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className={`primary-bg rounded-lg shadow-lg p-6 min-w-[300px] transform transition-all duration-200 ${show && !closing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {options.title && <h2 className="text-lg font-semibold mb-2">{options.title}</h2>}
        <div className="mb-4">{options.message}</div>
        <div className="flex justify-end gap-2">
          <Buton className="px-4 py-2 rounded"
            fullWidth={false}
            onClick={() => {
              setShow(false);
              setClosing(true);
              setTimeout(() => onClose(false), 200);
            }} >
            {options.cancelText || 'Anuluj'}
          </Buton>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={() => {
              setShow(false);
              setClosing(true);
              setTimeout(() => onClose(true), 200);
            }}
          >
            {options.confirmText || 'Potwierdź'}
          </button>
        </div>
      </div>
    </div>
  );
};
