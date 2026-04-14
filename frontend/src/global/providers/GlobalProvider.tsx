import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useRef, useState } from "react"
import { useIsDesktop } from "global/hooks/isMobile";
import { ViewState as ViewState, } from "global/headerStates";
import { Dictionaries } from "@shared/utils/DictionaryUtil";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dictionaries;
    loading: boolean;
    state: ViewState | null,
    isFooterHidden: boolean;
    getLanguagesList: () => string[];
    hideFooter: () => void;
    showFooter: () => void;
    setFloatingButton: (button: React.ReactNode, registrationId?: string) => void;
    floatingButton: React.ReactNode;
    floatingButtonKey: number;
    hideFloatingButton: boolean;
    setHideFloatingButton: (hide: boolean) => void;
}

interface Dictionaries {
	languages: DictionaryI | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const isDesktop = useIsDesktop();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null)

    const [loading, setLoading] = useState(false)
    const [state, setState] = useState<ViewState | null>(null)
    const [isFooterHidden, setIsFooterHidden] = useState(false)

    const [floatingButton, setFloatingButtonState] = useState<React.ReactNode>(null)
    const [floatingButtonKey, setFloatingButtonKey] = useState(0)
    const [hideFloatingButton, setHideFloatingButton] = useState(false)
    const floatingButtonIdRef = useRef<string | undefined>(undefined)

    const setFloatingButton = (button: React.ReactNode, registrationId?: string) => {
        if (button === null) {
            floatingButtonIdRef.current = undefined
            setFloatingButtonState(null)
        } else {
            if (registrationId !== floatingButtonIdRef.current) {
                floatingButtonIdRef.current = registrationId
                setFloatingButtonKey(k => k + 1)
            }
            setFloatingButtonState(button)
        }
    }

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
            state,
            isFooterHidden,
            getLanguagesList,
            hideFooter,
            showFooter,
            setFloatingButton,
            floatingButton,
            floatingButtonKey,
            hideFloatingButton,
            setHideFloatingButton
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