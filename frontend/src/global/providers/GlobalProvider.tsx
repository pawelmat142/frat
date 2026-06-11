import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useState } from "react"
import { useIsDesktop } from "global/hooks/isMobile";
import { Dictionaries } from "@shared/def/dictionary.def";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dictionaries;
    loading: boolean;
    isFooterHidden: boolean;
    getLanguagesList: () => string[];
    hideFooter: () => void;
    showFooter: () => void;
}

interface Dictionaries {
	languages: DictionaryI | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const isDesktop = useIsDesktop();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null)

    const [loading, setLoading] = useState(false)
    const [isFooterHidden, setIsFooterHidden] = useState(false)

    React.useEffect(() => {
        const initLanguagesDictionary = async () => {
            try {
                setLoading(true)
                const languages = await DictionaryService.getDictionary(Dictionaries.LANGUAGES)
                setLanguagesDictionary(languages)
            } catch (error) {
                setLanguagesDictionary(null)
            }
            finally {
                setLoading(false)
            }
        }
        initLanguagesDictionary()
    }, []);

    const getLanguagesList = (): string[] => {
        return languagesDictionary?.groups.find(g => g.code === 'TRANSLATIONS')?.elementCodes || []
    }

    const hideFooter = () => setIsFooterHidden(true)
    const showFooter = () => setIsFooterHidden(false)

    return (
        <GlobalContext.Provider value={{
            isDesktop: isDesktop,
            dics: {
                languages: languagesDictionary,
            },
            loading: loading,
            isFooterHidden,
            getLanguagesList,
            hideFooter,
            showFooter,
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobalContext = (): GlobalContextType => {
    const ctx = React.useContext(GlobalContext)
    if (!ctx) {
        throw new Error("useGlobalContext must be used within GlobalProvider")
    }
    return ctx;
}