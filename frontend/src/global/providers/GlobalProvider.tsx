import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useState } from "react"

interface GlobalContextType {
    // TODO 
    isMobile: boolean;
    dics: Dics;
    loading: boolean;
}

interface Dics {
	languages: DictionaryI | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const initLanguagesDictionary = async () => {
            try {
                setLoading(true);
                const dictionary = await DictionaryService.getDictionary('LANGUAGES');
                setLanguagesDictionary(dictionary);
            } catch (error) {
                setLanguagesDictionary(null);
            }
            finally {
                setLoading(false);
            }
        }
        initLanguagesDictionary();
    }, []);

    return (
        <GlobalContext.Provider value={{
            isMobile: true, //TODO
            dics: {
                languages: languagesDictionary,
            },
            loading: loading,
        }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobalContext = (): GlobalContextType => {
    const ctx = React.useContext(GlobalContext);
    if (!ctx) {
        throw new Error("useGlobalContext must be used within GlobalProvider");
    }
    return ctx;
}