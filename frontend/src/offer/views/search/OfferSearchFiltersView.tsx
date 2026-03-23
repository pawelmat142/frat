import { useGlobalContext } from "global/providers/GlobalProvider";
import { defaultOfferFilters, useOfferSearch } from "./OfferSearchProvider";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { OfferSearchFilters } from "@shared/interfaces/OfferI";
import { FormValidator } from "global/FormValidator";
import CountrySelector from "global/components/selector/CountrySelector";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { Ico } from "global/icon.def";
import { useEffect, useState } from "react";
import { GoogleMapService } from "global/services/GoogleMapService";
import { useUserContext } from "user/UserProvider";
import Header from "global/components/Header";

interface Props {
    onClose?: () => void;
}

const OfferSearchFiltersView: React.FC<Props> = ({ onClose }) => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();
    const ctx = useOfferSearch();

    const [loadingLocation, setLoadingLocation] = useState(false);

    const f = useForm<OfferSearchFilters>({
        defaultValues: ctx.filters
    })

    const startDateRequired = FormValidator.required(t);
    const required = FormValidator.required(t);
    const formState = f.watch()

    useEffect(() => {
        const autofillLocationCountry = async () => {
            if (!formState.locationCountries?.length && userCtx.position) {
                try {
                    setLoadingLocation(true);
                    const geoPosition = await GoogleMapService.getGeoPosition(userCtx.position);
                    const countryCode = geoPosition?.country?.toLocaleLowerCase();
                    const languages = globalCtx.dics.languages!;
                    const langAllowed = languages.elements.map((lang) => lang.code.toLocaleLowerCase()).includes(countryCode || '')
                    if (langAllowed) {
                        f.setValue('locationCountries', [countryCode!]);
                    }
                }
                catch (error) {
                    console.error('Error initializing location country:', error);
                } finally {
                    setLoadingLocation(false);
                }
            }
        }
        autofillLocationCountry();
    }, [userCtx.position])

    const submit = async () => {
        ctx.setFiltersWithSearchAndNavigate(formState)
    }

    const resetFilters = () => {
        f.reset(defaultOfferFilters);
        ctx.resetFilters()
    }

    return (
        <div className="form-view relative flex flex-col primary-bg">

            <Header onBack={() => onClose?.()} title={t("offer.searchTitle")} />

            <form className='flex flex-col flex-1'
                noValidate
                onSubmit={f.handleSubmit(submit)}
            >
                <Controller
                    name="locationCountries"
                    control={f.control}
                    rules={required}
                    render={({ field }) => (
                        <CountrySelector
                            {...field}
                            fullWidth
                            value={field.value?.[0] ?? undefined}
                            label={t("employeeProfile.form.locationCountry") + '*'}
                            className="w-full mt-5"
                            onSelect={item => {
                                f.setValue('locationCountries', item ? [item] : []);
                            }}
                        />
                    )}
                />

                <Controller
                    name="categories"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-5"
                            valueInput={field.value || []}
                            onSelectMulti={items => {
                                f.setValue('categories', items.map(i => String(i)));
                            }}
                            label={t("offer.filters.categories")}
                            code="WORK_CATEGORY"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="communicationLanguages"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-5"
                            valueInput={field.value || []}
                            onSelectMulti={items => {
                                f.setValue('communicationLanguages', items.map(i => String(i)));
                            }}
                            label={t("offer.filters.communicationLanguages")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            fullWidth
                        />
                    )}
                />
                <div className="mt-10">
                    <Button
                        size={BtnSizes.LARGE}
                        mode={BtnModes.PRIMARY} fullWidth type="submit">
                        <Ico.SEARCH size={22}></Ico.SEARCH>
                        {t("common.search")}
                    </Button>
                    <Button onClick={resetFilters} mode={BtnModes.ERROR_TXT} className="mt-3" fullWidth>
                        {t("common.reset")}
                    </Button>
                </div>

            </form>

        </div>
    )
}
export default OfferSearchFiltersView;

