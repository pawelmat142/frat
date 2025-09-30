import { createContext, useContext } from "react";

export interface AdminPanelTranslations {
    en: { [key: string]: string };
}
interface AdminPanelContextType {
    translation?: AdminPanelTranslations;
}

const AdminPanelContext = createContext<AdminPanelContextType | undefined>(undefined)

interface AdminPanelProviderProps {
    children?: React.ReactNode;
}


export const AdminPanelProvider: React.FC<AdminPanelProviderProps> = ({ children }) => {

    const value: AdminPanelContextType = {
        translation: undefined
    }

    return (
        <AdminPanelContext.Provider value={value}>
            {children}
        </AdminPanelContext.Provider>
    );
}

export const userAdminPanelContext = () => {
    const context = useContext(AdminPanelContext);
    if (!context) {
        throw new Error('userAdminPanelContext must be used within AdminPanelProvider');
    }
    return context;
}