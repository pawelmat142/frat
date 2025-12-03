import { useTranslation } from "react-i18next";
import { OfferSearchContextProps } from "./OfferSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import { useState } from "react";
import { OfferSearchFilters } from "@shared/interfaces/OfferI";
import { BtnModes } from "global/interface/controls.interface";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import FloatingInput from "global/components/controls/FloatingInput";

const OfferSearchFiltersSheet: React.FC<{ ctx: OfferSearchContextProps }> = ({ ctx }) => {
    const { t } = useTranslation();
    const drawerCtx = useDrawer();

    // LOCAL STATE IS REQUIRED HERE BCS ctx.filters UPDATES ONLY ON "APPLY" ACTION
    const [localFilters, setLocalFilters] = useState<OfferSearchFilters>(ctx.filters);

    const resetFilters = () => {
        ctx.resetFilters()
        setLocalFilters(ctx.defaultFilters);
        drawerCtx.close();
    }

    // TODO adjust translations
    return (
        <div className="flex flex-col px-3 pt-5 gap-1">

            <DictionarySelector
                type='multi'
                className="w-full"
                valueInput={localFilters.categories}
                onSelectMulti={items => {
                    const filters = { ...localFilters, categories: items.map(i => String(i)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("offer.filters.categories")}
                code="WORK_CATEGORY"
                fullWidth
                required
            />

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.locationCountries}
                onSelectMulti={items => {
                    const filters = { ...localFilters, locationCountries: items.map(i => String(i)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("offer.filters.countries")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                elementLabelTranslationKey="COUNTRY_NAME"
                fullWidth
            />

            <DictionarySelector
                type='multi'
                className="w-full"
                valueInput={localFilters.communicationLanguages}
                onSelectMulti={items => {
                    const filters = { ...localFilters, communicationLanguages: items.map(i => String(i)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("offer.filters.communicationLanguages")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
            />

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.skills}
                onSelectMulti={items => {
                    const filters = { ...localFilters, skills: items.map(i => String(i)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("employeeProfile.form.skills")}
                code="SKILLS"
                fullWidth
            />

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.certificates}
                onSelectMulti={items => {
                    const filters = { ...localFilters, certificates: items.map(i => String(i)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("employeeProfile.form.certificates")}
                code="CERTIFICATES"
                fullWidth
            />
            <FloatingInput
                type="number"
                value={localFilters.hourlySalaryStart ?? ""}
                onChange={(value) => {
                    // todo debounce
                    const filters = { ...localFilters, hourlySalaryStart: value.target.value ? Number(value.target.value) : null };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("offer.hourlySalaryStart")}
                fullWidth
                name={""}
            />
            <FloatingInput
                type="number"
                value={localFilters.monthlySalaryStart ?? ""}
                onChange={(value) => {
                    // todo debounce
                    const filters = { ...localFilters, monthlySalaryStart: value.target.value ? Number(value.target.value) : null };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("offer.monthlySalaryStart")}
                fullWidth
                name={""}
            />

            <Button onClick={resetFilters} mode={BtnModes.ERROR} className="mt-5" fullWidth>
                {t("common.reset")}
            </Button>

        </div>
    );
}
export default OfferSearchFiltersSheet;