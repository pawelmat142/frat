import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import { Path } from "../../path";
import React from "react"
import { createContext, useState } from "react"
import MainHeaderState from "global/header-state/MainHeaderState";
import { useLocation } from "react-router-dom";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { useIsDesktop } from "global/hooks/isMobile";
import HeaderMenu from "global/components/HeaderMenu";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dics;
    loading: boolean;
    header: HeaderState
}

interface Dics {
	languages: DictionaryI | null;
}

interface HeaderState {
    title?: string;
    leftBtn?: React.ReactNode;
    rightBtn?: React.ReactNode;
}

const STATES: { [key: string]: HeaderState } = {
    [Path.HOME]: {
        leftBtn: <MainHeaderState/>,
        rightBtn: <HeaderMenu/>,
    },
    [Path.EMPLOYEE_SEARCH]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'employeeProfile.searchTitle',
    }
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const location = useLocation(); 

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
        const path = location.pathname
        const state = STATES[path]
        console.log(state)
        if (state) {
            setHeader(state)
        } else {
            setHeader({
                leftBtn: <HeaderBackBtn />,
            })
        }
    }, [location.pathname])

    const isDesktop = useIsDesktop();

    return (
        <GlobalContext.Provider value={{
            isDesktop: isDesktop,
            dics: {
                languages: languagesDictionary,
            },
            loading: loading,
            header: header,
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