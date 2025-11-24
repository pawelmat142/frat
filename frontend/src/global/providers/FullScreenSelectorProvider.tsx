import Header from 'global/components/Header';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FullScreenDialogContextType {
  open(config: FullScreenDialogConfig): Promise<boolean>;
  close: () => void;
}

interface FullScreenDialogConfig {
  children: ReactNode;
  title?: string;
  onSubmit?: <T>(result?: T | null) => void;
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
    config: FullScreenDialogConfig;
    resolve?: (result: boolean) => void;
  }>({ open: false, config: { children: null } });


  const open = (config: FullScreenDialogConfig) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, config, resolve });
    })
  }

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState({ ...state, open: false, resolve: undefined });
  };

  return (
    <FullScreenDialogContext.Provider value={{ open, close: () => handleClose(false) }}>
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
  config: FullScreenDialogConfig;
  className?: string;
  onClose: (result: boolean) => void;
}

const FullScreenDialog: React.FC<FullScreenDialogProps> = ({ open, onClose, config, className }) => {

  const [visible, setVisible] = React.useState(open);
  const [show, setShow] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  const overlayClass = `popup fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 ${show && !closing ? 'opacity-100' : 'opacity-0'}`;
  return (
    <div className={overlayClass}>
      <div className={`${className} primary-bg rounded-lg shadow-lg w-full h-full max-w-full max-h-full transform transition-all duration-200 ${show && !closing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} popup-content`}>
        <Header onBack={() => onClose(false)} title={config?.title} hideMenu={true}></Header>
        {config?.children}
      </div>
    </div>
  )
};
