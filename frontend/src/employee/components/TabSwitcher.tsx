import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import React from "react";

export interface TabSwitcherOption {
    label: string;
    code: string;
}

interface TabSwitcherProps {
    options: TabSwitcherOption[];
    value: string;
    onChange: (code: string) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ options, value, onChange }) => {
    const selectedIdx = options.findIndex(opt => opt.code === value);
    return (
        <nav className="tab-switcher" aria-label="Tabs">
            {options.map((opt, idx) => (
                <button
                    key={opt.code}
                    type="button"
                    className={`tab-switcher-option ${selectedIdx === idx && ' active'}`}
                    onClick={() => onChange(opt.code)}
                >
                    {opt.label}
                </button>
            ))}
        </nav>
    );
};

export default TabSwitcher;
