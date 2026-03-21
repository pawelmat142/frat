import React from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import FloatingPlaceSearch, { PlaceSearchResult } from 'global/components/controls/FloatingPlaceSearch';
import { FloatingInputModes } from 'global/interface/controls.interface';

interface Props {
    mapInstanceRef: google.maps.Map | null;
    updatePosition: (position: { lat: number; lng: number }) => void;
    displaValue?: string;
    onCancel: () => void;
    label?: string;
}

const PositionSelectorSearchbar: React.FC<Props> = ({ mapInstanceRef, onCancel, updatePosition, label, displaValue }) => {
    const { t } = useTranslation();

    const handlePlaceSelect = (result: PlaceSearchResult) => {
        updatePosition({ lat: result.lat, lng: result.lng });
    };

    return (
        <div className="position-selector-searchbar w-full mr-2">
            <div className="position-selector-header p-2 flex items-center justify-between border-b primary-bg">
                <FloatingPlaceSearch
                    className='w-full'
                    mode={FloatingInputModes.THIN}
                    name="freeText"
                    displayValue={displaValue}
                    onSelect={handlePlaceSelect}
                    mapInstanceRef={mapInstanceRef}
                    label={label || t('employeeProfile.form.freeText')}
                    fullWidth
                />

                <button
                    onClick={() => onCancel()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
};

export default PositionSelectorSearchbar;
