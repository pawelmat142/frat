import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import IconButton from 'global/components/controls/IconButon';

export interface MapNavigationProps {
    selectedIndex: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
}

const MapNavigation: React.FC<MapNavigationProps> = ({
    selectedIndex,
    total,
    onPrev,
    onNext,
}) => (
    <div className="map-overlay-nav primary-bg">
        <IconButton icon={<FaChevronLeft />} onClick={onPrev} disabled={selectedIndex === 0} className="px-6" />
        <span className="s-font secondary-text">{selectedIndex + 1}/{total}</span>
        <IconButton icon={<FaChevronRight />} onClick={onNext} disabled={selectedIndex === total - 1} className="px-6" />
    </div>
);

export default MapNavigation;