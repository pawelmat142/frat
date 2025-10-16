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
        <div className="flex flex-col gap-2">
            <div className="border-b border-color">
                <nav className="-mb-px flex justify-center gap-2" aria-label="Tabs">
                    {options.map((opt, idx) => (
                        <button
                            key={opt.code}
                            type="button"
                            className={`tab-switcher-option px-4 py-2 ${selectedIdx === idx && ' active'}`}
                            onClick={() => onChange(opt.code)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default TabSwitcher;
