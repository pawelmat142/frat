import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import { useBottomSheet } from "global/providers/BottomSheetProvider";

const EmployeeSearchFiltersSheet: React.FC<{ctx: EmployeeSearchContextProps}> = ({ctx}) => {

    const { t } = useTranslation();

    const drawerCtx = useDrawer();
    const bottomSheetCtx = useBottomSheet()
    
    const handleSkillsSelection = () => {
        drawerCtx.close();
        bottomSheetCtx.openDictionarySelector({
            multiSelect: true,  
            title: t("employeeProfile.form.skills"),
            translateItems: true,
            code: "SKILLS",
            selectedValues: ctx.filters.skills || [],
            onSelectMulti: (items) => {
                ctx.setFilters({ ...ctx.filters, skills: items.map(i => String(i.value)) });
            },
        })
    }

    const handleCertificatesSelection = () => {
        drawerCtx.close();
        bottomSheetCtx.openDictionarySelector({
            multiSelect: true,  
            title: t("employeeProfile.form.certificates"),
            translateItems: true,
            code: "CERTIFICATES",
            selectedValues: ctx.filters.certificates || [], 
            onSelectMulti: (items) => {
                ctx.setFilters({ ...ctx.filters, certificates: items.map(i => String(i.value)) });
            },
        })
    }

    const handleCommunicationLanguagesSelection = () => {
        drawerCtx.close();
        bottomSheetCtx.openDictionarySelector({
            multiSelect: true,
            title: t("employeeProfile.form.communicationLanguages"),
            translateItems: true,
            code: "LANGUAGES",
            groupCode: "COMMUNICATION",
            selectedValues: ctx.filters.communicationLanguages || [], 
            onSelectMulti: (items) => {
                ctx.setFilters({ ...ctx.filters, communicationLanguages: items.map(i => String(i.value)) });
            },
        })
    }

    const resetFilters = () => {
        ctx.resetFilters()
        drawerCtx.close();
    }

    return (
        <div className="flex flex-col py-3 px-5">


            <div className="bottom-sheet-item" onClick={handleSkillsSelection}>
                {t("employeeProfile.form.skills")}
            </div>

            <div className="bottom-sheet-item" onClick={handleCertificatesSelection}>
                {t("employeeProfile.form.certificates")}
            </div>

            <div className="bottom-sheet-item" onClick={handleCommunicationLanguagesSelection}>
                {t("employeeProfile.form.communicationLanguages")}
            </div>

            <div className="bottom-sheet-item" onClick={resetFilters}>
                {t("common.reset")}
            </div>

        </div>
    );
};

export default EmployeeSearchFiltersSheet;
