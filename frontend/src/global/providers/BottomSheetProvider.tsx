import { SelectorItem, SelectorValue } from 'global/interface/controls.interface';
import React, { createContext, useContext, useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import { Utils } from 'global/utils';

export interface BottomSheetParams<T extends SelectorValue = SelectorValue> {
    title?: string;
    items: SelectorItem<T>[];
    multiSelect?: boolean;
    selectedValues?: T[];
    translateItems?: boolean
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
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

interface BottomSheetContextType {
    open: <T extends SelectorValue = SelectorValue>(params: BottomSheetParams<T>) => void;
    close: () => void;
    openDictionarySelector: (params: BottomSheetDictionaryParams) => Promise<void>;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [params, setParams] = useState<BottomSheetParams<any> | null>(null);

    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);
    const [groupCode, setGroupCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const open = <T extends SelectorValue = SelectorValue>(newParams: BottomSheetParams<T>) => {
        setParams(newParams as unknown as BottomSheetParams<any>);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setTimeout(() => {
            setParams(null)
        }, 300); // czekamy na animację zamknięcia
    };

    const openDictionarySelector = async (params: BottomSheetDictionaryParams) => {

        const dic = await initDictionary(params);
        setGroupCode(params.groupCode || null);
        const items = Utils.dictionaryToSelectorItems<string>(dic);
        open({
            items,
            title: params.title,
            multiSelect: params.multiSelect,
            selectedValues: params.selectedValues,
            translateItems: params.translateItems,
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
        <BottomSheetContext.Provider value={{ open, close, openDictionarySelector }}>
            {children}
            {params && (
                <BottomSheet
                    isOpen={isOpen}
                    onClose={close}
                    title={params.title}
                    items={params.items}
                    translateItems={params.translateItems}
                    selectedValues={params.selectedValues}
                    onSelect={(item) => {
                        params.onSelect?.(item);
                        if (!params.multiSelect) {
                            close();
                        }
                    }}
                    onSelectMulti={(items) => {
                        params.onSelectMulti?.(items);
                        close();
                    }}
                    multiSelect={params.multiSelect}
                />
            )}
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
