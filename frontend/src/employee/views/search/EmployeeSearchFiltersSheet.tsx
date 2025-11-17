import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import DateRangeInput from "global/components/controls/DateRangeInput";
import { DateRange } from "@shared/interfaces/EmployeeProfileI";

const EmployeeSearchFiltersSheet: React.FC<{ ctx: EmployeeSearchContextProps }> = ({ ctx }) => {

    const { t } = useTranslation();
    const drawerCtx = useDrawer();

    const [skills, setSkills] = React.useState<string[]>(ctx.filters.skills || []);
    const [certificates, setCertificates] = React.useState<string[]>(ctx.filters.certificates || []);
    const [languages, setLanguages] = React.useState<string[]>(ctx.filters.communicationLanguages || []);
    const [dateRange, setDateRange] = React.useState<DateRange | null>(ctx.filters.dateRange || null);

    const resetFilters = () => {
        ctx.resetFilters()
        drawerCtx.close();
    }

    return (
        <div className="flex flex-col px-3 pt-5 gap-1">

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={skills}
                onSelectMulti={items => {
                    const skillValues = items.map(i => String(i.value));
                    ctx.setFilters({ ...ctx.filters, skills: skillValues })
                    setSkills(skillValues);
                }}
                label={t("employeeProfile.form.skills")}
                code="SKILLS"
                fullWidth
            />

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={certificates}
                onSelectMulti={items => {
                    const certificateValues = items.map(i => String(i.value));
                    ctx.setFilters({ ...ctx.filters, certificates: certificateValues })
                    setCertificates(certificateValues);
                }}
                label={t("employeeProfile.form.certificates")}
                code="CERTIFICATES"
                fullWidth
            />

            <DictionarySelector
                type='multi'
                className="w-full"
                valueInput={languages}
                onSelectMulti={items => {
                    const languageValues = items.map(i => String(i.value));
                    ctx.setFilters({ ...ctx.filters, communicationLanguages: languageValues })
                    setLanguages(languageValues);
                }}
                label={t("employeeProfile.form.communicationLanguage")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
            />

            <DateRangeInput
                label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") }
                className="w-full"
                value={dateRange}
                onChange={(dateRange) => {
                    if (dateRange) {
                        setDateRange(dateRange);
                        ctx.setFilters({ ...ctx.filters, dateRange });
                    }
                }}
            />

            <Button onClick={resetFilters} mode={BtnModes.ERROR} className="mt-5" fullWidth>
                {t("common.reset")}
            </Button>

        </div>
    );
};

export default EmployeeSearchFiltersSheet;
