import { DictionaryI } from "@shared/interfaces/DictionaryI"
import { DictionaryService } from "global/services/DictionaryService"
import React from "react"
import { createContext, useState } from "react"
import { useIsDesktop } from "global/hooks/isMobile";
import { Dictionaries } from "@shared/def/dictionary.def";
import { ContextMenuOptions, MenuGroup } from "global/interface/controls.interface";
import ContextMenu from "global/components/ui/ContextMenu";
import { AppConfig } from "@shared/AppConfig";

interface GlobalContextType {
    isDesktop: boolean;
    dics: Dictionaries;
    loading: boolean;
    isFooterHidden: boolean;
    getLanguagesList: () => string[];
    hideFooter: () => void;
    showFooter: () => void;
    openContextMenu: (position: ContextMenuPosition, groups: MenuGroup[], options?: ContextMenuOptions) => void;
    closeContextMenu: () => void;
}

interface Dictionaries {
	languages: DictionaryI | null;
}

interface ContextMenuPosition {
    x: number;
    y: number;
}

interface ContextMenuState {
    position: ContextMenuPosition;
    groups: MenuGroup[];
    options?: ContextMenuOptions;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const isDesktop = useIsDesktop();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null)

    const [loading, setLoading] = useState(false)
    const [isFooterHidden, setIsFooterHidden] = useState(false)
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
    const [isContextMenuClosing, setIsContextMenuClosing] = useState(false)
    const contextMenuTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const pendingContextMenuRef = React.useRef<ContextMenuState | null>(null)

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

    const closeContextMenu = React.useCallback(() => {
        if (contextMenuTimerRef.current) clearTimeout(contextMenuTimerRef.current)
        pendingContextMenuRef.current = null
        setIsContextMenuClosing(true)
        contextMenuTimerRef.current = setTimeout(() => {
            setContextMenu(null)
            setIsContextMenuClosing(false)
            contextMenuTimerRef.current = null
        }, AppConfig.CONTEXT_MENU.ANIMATION_DURATION)
    }, [])

    const openContextMenu = React.useCallback((position: ContextMenuPosition, groups: MenuGroup[], options?: ContextMenuOptions) => {
        if (!groups.some(group => group.items.some(item => item.if === undefined || !!item.if))) return

        const nextMenu = { position, groups, options }
        if (contextMenu) {
            if (contextMenuTimerRef.current) clearTimeout(contextMenuTimerRef.current)
            pendingContextMenuRef.current = nextMenu
            setIsContextMenuClosing(true)
            contextMenuTimerRef.current = setTimeout(() => {
                setContextMenu(pendingContextMenuRef.current)
                pendingContextMenuRef.current = null
                setIsContextMenuClosing(false)
                contextMenuTimerRef.current = null
            }, AppConfig.CONTEXT_MENU.ANIMATION_DURATION)
            return
        }

        setContextMenu(nextMenu)
    }, [contextMenu])

    React.useEffect(() => () => {
        if (contextMenuTimerRef.current) clearTimeout(contextMenuTimerRef.current)
    }, [])

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
            openContextMenu,
            closeContextMenu,
        }}>
            {children}
            {contextMenu && (
                <ContextMenu
                    groups={contextMenu.groups}
                    width={contextMenu.options?.width}
                    position={contextMenu.position}
                    closing={isContextMenuClosing}
                    onClose={closeContextMenu}
                />
            )}
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