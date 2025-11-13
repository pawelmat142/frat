import { createContext, useContext } from "react";
import { useState } from "react";
import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { EmployeeProfilesAdminService } from "admin/services/EmployeeProfilesAdmin.service";

export interface AdminPanelTranslations {
    translations?: TranslationI[];
    languages?: TranslationListDto[];
    selectedLanguage?: string
    initTranslations: () => Promise<void>;
    updateTranslation?: (translation: TranslationI) => void; // update context state
    saveTranslation?: (translation: TranslationI) => Promise<void>; // save to db and update context state
    loadLanguage?: (langCode: string) => Promise<void>; // fetch translation and update context state
}

export interface AdminPanelEmployeeProfiles {
    profiles?: EmployeeProfileI[]
    initProfiles: () => Promise<void>;
}

interface AdminPanelContextType {
    translation?: AdminPanelTranslations
    employeeProfiles?: AdminPanelEmployeeProfiles
}

const AdminPanelContext = createContext<AdminPanelContextType | undefined>(undefined)

interface AdminPanelProviderProps {
    children?: React.ReactNode;
}

export const AdminPanelProvider: React.FC<AdminPanelProviderProps> = ({ children }) => {
    const [languages, setLanguages] = useState<TranslationListDto[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
    const [translations, setTranslations] = useState<TranslationI[]>([]);

    const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfileI[]>([])

    const initTranslations = async () => {
        const langs = await TranslationAdminService.getLanguagesList();
        if (langs.find(l => l.code === 'en')) {
            await loadLanguage('en');
        }
        setLanguages(langs);
    }

    const loadLanguage = async (langCode: string) => {
        const translation = await TranslationAdminService.getTranslation(langCode);
        setSelectedLanguage(langCode);

        const index = translations.findIndex(t => t.langCode === langCode);
        if (index !== -1) {
            const _translations = translations.map(t => t.langCode === langCode ? translation : t);
            setTranslations(_translations);
        } else {
            translations.push(translation);
            setTranslations(translations);
        }
    }

    const updateTranslation = (translation: TranslationI) => {
        const _translation = translations.map(t => t.langCode === translation.langCode ? translation : t);
        setTranslations(_translation);
    }

    const saveTranslation = async (translation: TranslationI): Promise<void> => {
        const _translation = await TranslationAdminService.putTranslation(translation);
        updateTranslation(_translation);
    }

    const value: AdminPanelContextType = {
        translation: {
            translations: translations,
            languages,
            selectedLanguage,
            initTranslations: initTranslations,
            updateTranslation: updateTranslation,
            saveTranslation: saveTranslation,
            loadLanguage: loadLanguage
        },
    };

    const initProfiles = async () => {
        const profiles = await EmployeeProfilesAdminService.listProfiles();
        setEmployeeProfiles(profiles);
    }

    value.employeeProfiles = { 
        profiles: employeeProfiles,
        initProfiles: initProfiles
    };

    return (
        <AdminPanelContext.Provider value={value}>
            {children}
        </AdminPanelContext.Provider>
    );
}

export const userAdminPanelContext = () => {
    const context = useContext(AdminPanelContext);
    return context;
}