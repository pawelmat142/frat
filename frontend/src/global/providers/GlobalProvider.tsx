import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useRef, useState } from "react"
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { useIsDesktop } from "global/hooks/isMobile";
import { ViewState as ViewState, HEADER_STATES } from "global/headerStates";
import { Dictionaries } from "@shared/utils/DictionaryUtil";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dictionaries;
    loading: boolean;
    state: ViewState | null,
    isFooterHidden: boolean;
    setHeaderMenu: (menu: React.ReactNode) => void;
    setViewState: (state: ViewState) => void;
    getLanguagesList: () => string[];
    hideFooter: () => void;
    showFooter: () => void;
    setFloatingButton: (button: React.ReactNode, registrationId?: string) => void;
    floatingButton: React.ReactNode;
    floatingButtonKey: number;
}

interface Dictionaries {
	languages: DictionaryI | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const location = useLocation(); 
    const isDesktop = useIsDesktop();
    const navigate = useNavigate();

    const headerStates = HEADER_STATES(navigate);

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null)

    const [loading, setLoading] = useState(false)
    const [state, setState] = useState<ViewState | null>(null)
    const [isFooterHidden, setIsFooterHidden] = useState(false)

    const [floatingButton, setFloatingButtonState] = useState<React.ReactNode>(null)
    const [floatingButtonKey, setFloatingButtonKey] = useState(0)
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

    React.useEffect(() => {
        const pathname = location.pathname
        let resolved: ViewState | undefined
        for (const [pattern, state] of Object.entries(headerStates)) {
            if (matchPath({ path: pattern, end: true }, pathname)) {
                resolved = state
                break
            }
        }
        if (resolved) {
            setState(resolved)
            setIsFooterHidden(resolved.hideFooter ?? false)
        } else {
            setState(null)
            setIsFooterHidden(false)
        }
    }, [location.pathname])

    const setHeaderMenu = (menu: React.ReactNode): void => {
        setState(state => ({
            ...state,
            rightBtn: menu,
        }))  
    }

    const setViewState = (state: ViewState): void => {
        setState(state)
        setIsFooterHidden(state.hideFooter ?? false)
    }

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
            setHeaderMenu,
            setViewState,
            getLanguagesList,
            hideFooter,
            showFooter,
            setFloatingButton,
            floatingButton,
            floatingButtonKey,
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