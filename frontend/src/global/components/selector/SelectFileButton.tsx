import React, { useRef } from 'react';
import Button from '../controls/Button';
import { BtnModes } from 'global/interface/controls.interface';

interface SelectFileButtonProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  label: string
}

const SelectFileButton: React.FC<SelectFileButtonProps> = ({ onFileSelected, disabled, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Button onClick={handleClick} mode={BtnModes.PRIMARY_TXT} disabled={disabled}>
        {label}
      </Button>
    </>
  );
};

export default SelectFileButton;
