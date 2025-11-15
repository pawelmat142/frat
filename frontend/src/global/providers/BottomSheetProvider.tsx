import { SelectorItem, SelectorValue } from 'global/interface/controls.interface';
import React, { createContext, useContext, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import { Utils } from 'global/utils';
import { useIsDesktop } from 'global/hooks/isMobile';
import SelectorItems from 'global/components/selector/SelectorItems';
import { usePopup } from './PopupProvider';

export interface OpenSheetParams {
    title?: string;
    children: React.ReactNode;
    showClose?: boolean;
}

export interface BottomSheetDictionaryParams<T extends SelectorValue = SelectorValue> {
    title?: string;
    code: string;
    groupCode?: string;
    multiSelect?: boolean;
    translateItems?: boolean
    selectedValues?: T[];
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
}

export interface OpenSelectorParams<T extends SelectorValue = SelectorValue> {
    title?: string;
    translateItems?: boolean
    items: SelectorItem<T>[];
    selectedValues?: T[];
    multiSelect?: boolean;
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
}

export interface OpenDictionaryParams<T extends SelectorValue = SelectorValue> {
    title?: string;
    code: string;
    translateItems?: boolean
    groupCode?: string;
    selectedValues?: T[];
    multiSelect?: boolean;
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
}

interface BottomSheetContextType {
    open: (params: OpenSheetParams) => void;
    openSelector: <T extends SelectorValue = SelectorValue>(params: OpenSelectorParams<T>) => Promise<void>;
    openDictionarySelector: (params: OpenDictionaryParams) => Promise<void>;
    close: () => void;
    params: OpenSheetParams | null;
    isOpen: boolean;
    closing: boolean;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [params, setParams] = useState<OpenSheetParams | null>(null);
    const [closing, setClosing] = useState(false);

    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [groupCode, setGroupCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isDesktop = useIsDesktop();

    const popupCtx = usePopup();

    const open = (newParams: OpenSheetParams) => {
        if (isDesktop) {
            popupCtx.popup({
                title: newParams.title,
                children: newParams.children,
                showClose: newParams.showClose,
            })
            return
        }
        setParams(newParams);
        setIsOpen(true);
    };

    const close = () => {
        setClosing(true);
        popupCtx.close();
        setTimeout(() => {
            setIsOpen(false);
            setParams(null)
            setClosing(false);
        }, 300); // czekamy na animację zamknięcia
    };


    const openSelector = async <T extends SelectorValue = SelectorValue>(params: OpenSelectorParams<T>) => {
        open({
            title: params.title,
            showClose: true,
            children: <SelectorItems
                items={params.items} selectedValues={params.selectedValues}
                multiSelect={params.multiSelect}
                translateItems={params.translateItems}
                onSelect={(item) => {
                    close()
                    params.onSelect?.(item)
                }}
                onSelectMulti={(items) => {
                    params.onSelectMulti?.(items)
                }}
            ></SelectorItems>
        })
    }

    const openDictionarySelector = async (params: OpenDictionaryParams) => {
        const dic = await initDictionary(params);
        setGroupCode(params.groupCode || null);
        const items = Utils.dictionaryToSelectorItems<string>(dic);
        openSelector({
            title: params.title,
            selectedValues: params.selectedValues,
            multiSelect: params.multiSelect,
            translateItems: params.translateItems,
            items: items,
            onSelect: params.onSelect,
            onSelectMulti: params.onSelectMulti,
        })
    }

    const initDictionary = async (params: BottomSheetDictionaryParams): Promise<DictionaryI> => {
        if (dictionary?.code === params.code && (!params.groupCode || params.groupCode === groupCode)) {
            return dictionary
        }
        setLoading(true);
        const res = await DictionaryService.getDictionary(params.code, params.groupCode);
        setDictionary(res);
        setLoading(false);
        return res;
    }

    return (
        <BottomSheetContext.Provider value={{ open, close, openDictionarySelector, openSelector, params, isOpen, closing }}>
            {params && (
                <BottomSheet />
            )}
            {children}
        </BottomSheetContext.Provider>
    );
};

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (context === undefined) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
};
