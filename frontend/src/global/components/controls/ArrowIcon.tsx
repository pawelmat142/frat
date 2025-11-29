import React from 'react';

interface ArrowIconProps {
    open: boolean;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ open }) => (
    <span className={`dropdown-arrow${open ? ' open' : ''} secondary-text`}
        aria-hidden="true"
    >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </span>
);

export default ArrowIcon;
