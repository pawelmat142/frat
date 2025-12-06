import { useTranslation } from "react-i18next";
import { defaultOfferFilters, OfferSearchContextProps } from "./OfferSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import { useEffect, useState } from "react";
import { Currency, OfferSearchFilters } from "@shared/interfaces/OfferI";
import { BtnModes } from "global/interface/controls.interface";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import FloatingInput from "global/components/controls/FloatingInput";
import CurrencySelector from "offer/components/CurrencySelector";
import { useLocation } from "react-router-dom";
import { OfferUtil } from "offer/OfferUtil";
import { FaSearch } from "react-icons/fa";

const OfferSearchFiltersSheet: React.FC<{ ctx: OfferSearchContextProps }> = ({ ctx }) => {
    const { t } = useTranslation();
    const drawerCtx = useDrawer();
    const location = useLocation();

    const [localFilters, setLocalFilters] = useState<OfferSearchFilters>(defaultOfferFilters);

    useEffect(() => {
        const currentFilters = OfferUtil.parseFiltersFromSearch(location.search, defaultOfferFilters)
        setLocalFilters(currentFilters);
    }, [])

    const resetFilters = () => {
        ctx.resetFilters()
        drawerCtx.close();
    }

    const search = () => {
        ctx.setFilters(localFilters);
        drawerCtx.close();
    }

    return (
        <div className="flex flex-col px-3 pt-5 gap-1">

            <DictionarySelector
                type='multi'
                className="w-full"
                valueInput={localFilters.categories}
                onSelectMulti={items => {
                    const filters = { ...localFilters, categories: items.map(i => String(i)) };
                    setLocalFilters(filters);
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
                }}
                label={t("employeeProfile.form.certificates")}
                code="CERTIFICATES"
                fullWidth
            />

            <CurrencySelector
                value={localFilters.currency}
                onChange={value => {
                    const filters = { ...localFilters, currency: value ? `${value}` as Currency : null };
                    setLocalFilters(filters);
                }}
            />
            {!!localFilters.currency && (<>
                <FloatingInput
                    type="number"
                    value={localFilters.hourlySalaryStart ?? ""}
                    onChange={(value) => {
                        setLocalFilters({ ...localFilters, hourlySalaryStart: value.target.value ? Number(value.target.value) : null });
                    }}
                    label={t("offer.hourlySalaryStart")}
                    fullWidth
                    name={""}
                />
                <FloatingInput
                    type="number"
                    value={localFilters.monthlySalaryStart ?? ""}
                    onChange={(value) => {
                        setLocalFilters({ ...localFilters, monthlySalaryStart: value.target.value ? Number(value.target.value) : null });
                    }}
                    label={t("offer.monthlySalaryStart")}
                    fullWidth
                    name={""}
                />
            </>)}

            <div className="mt-10">
                <Button onClick={search} mode={BtnModes.PRIMARY} fullWidth>
                    <FaSearch size={22}></FaSearch>
                    {t("common.search")}
                </Button>
                <Button onClick={resetFilters} mode={BtnModes.ERROR_TXT} className="mt-3" fullWidth>
                    {t("common.reset")}
                </Button>
            </div>


        </div>
    );
}
export default OfferSearchFiltersSheet;