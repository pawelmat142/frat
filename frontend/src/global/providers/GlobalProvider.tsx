import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useState } from "react"
import { useLocation, matchPath } from "react-router-dom";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { useIsDesktop } from "global/hooks/isMobile";
import { HeaderState, STATES } from "global/header-state/states";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dictionaries;
    loading: boolean;
    header: HeaderState,
    setHeaderMenu: (menu: React.ReactNode) => void;
}

interface Dictionaries {
	languages: DictionaryI | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const location = useLocation(); 
    const isDesktop = useIsDesktop();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null)
    const [loading, setLoading] = useState(false)
    const [header, setHeader] = useState<HeaderState>({})

    React.useEffect(() => {
        const initLanguagesDictionary = async () => {
            try {
                setLoading(true)
                const dictionary = await DictionaryService.getDictionary('LANGUAGES')
                setLanguagesDictionary(dictionary)
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
        let resolved: HeaderState | undefined
        for (const [pattern, state] of Object.entries(STATES)) {
            if (matchPath({ path: pattern, end: true }, pathname)) {
                resolved = state
                break
            }
        }
        if (resolved) {
            setHeader(resolved)
        } else {
            setHeader({ leftBtn: <HeaderBackBtn /> })
        }
    }, [location.pathname])

    const setHeaderMenu = (menu: React.ReactNode): void => {
        setHeader({
            ...header,
            rightBtn: menu,
        })  
    }

    return (
        <GlobalContext.Provider value={{
            isDesktop: isDesktop,
            dics: {
                languages: languagesDictionary,
            },
            loading: loading,
            header: header,
            setHeaderMenu,
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