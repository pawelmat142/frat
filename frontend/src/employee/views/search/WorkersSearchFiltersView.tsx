import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { WorkersSearchContextProps, WorkerDefaultFilters, useWorkersSearch } from "./WorkersSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRange, WorkerSearchSortOptions, WorkerSearchFilters } from "@shared/interfaces/WorkerProfileI";
import { BtnModes, BtnSizes, SelectorItem } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { Controller, useForm } from "react-hook-form";
import { FormValidator } from "global/FormValidator";
import Button from "global/components/controls/Button";
import { FaSearch } from "react-icons/fa";
import CountrySelector from "global/components/selector/CountrySelector";
import FloatingInput from "global/components/controls/FloatingInput";
import DictionarySelector from "global/components/selector/DictionarySelector";
import { DateUtil } from "@shared/utils/DateUtil";

const WorkersSearchFiltersView: React.FC = () => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext()
    const ctx: WorkersSearchContextProps = useWorkersSearch()

    const f = useForm<WorkerSearchFilters>({
        defaultValues: ctx.filters
    })

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (
            <div>
                <Loading></Loading>
            </div>
        )
    }
    const formState = f.watch()

    const startDateRequired = FormValidator.required(t);
    const required = FormValidator.required(t);


    const submit = async () => {
        ctx.setFiltersWithSearchAndNavigate(formState);
        console.log('Submitting form with values:', formState);
    }

    const sortOptionItems: SelectorItem<string>[] = Object.keys(WorkerSearchSortOptions).map((option: string) => ({
        value: option,
        label: t('employeeProfile.form.sortOptions.' + option)
    }))

    const resetFilters = () => {
        f.reset(WorkerDefaultFilters);
        ctx.resetFilters()
    }

    const prepareDateRange = (): DateRange | null => {
        const localFilters = formState
        if (!localFilters.startDate) {
            return null
        }
        return {
            start: DateUtil.parseDateFromStringLocalDate(localFilters.startDate),
            end: DateUtil.parseDateFromStringLocalDate(localFilters.endDate)
        }
    }

    return (
        <div className="form-view relative flex flex-col">
            <form className='flex flex-col flex-1'
                noValidate
                onSubmit={f.handleSubmit(submit)}
            >
                <Controller
                    name="startDate"
                    control={f.control}
                    rules={startDateRequired}
                    render={({ field }) => (
                        <DateRangeInputViewSelector
                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + '*'}
                            className="w-full mt-5"
                            value={prepareDateRange()}
                            error={f.formState.errors.startDate?.message}
                            onChange={(dateRange) => {
                                const filters: WorkerSearchFilters = {
                                    ...formState,
                                    startDate: DateUtil.toLocalDateString(dateRange?.start) || null,
                                    endDate: DateUtil.toLocalDateString(dateRange?.end) || null
                                };
                                f.reset(filters)
                            }}
                        />
                    )}
                />

                <Controller
                    name="locationCountry"
                    control={f.control}
                    rules={required}
                    render={({ field }) => (
                        <CountrySelector
                            {...field}
                            fullWidth
                            value={field.value ?? undefined}
                            label={t("employeeProfile.form.locationCountry") + '*'}
                            className="w-full mt-5"
                            error={f.formState.errors.locationCountry}
                            onSelect={item => {
                                f.setValue('locationCountry', item);
                            }}
                        />
                    )}
                />

                <Controller
                    name="freeText"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            fullWidth
                            value={field.value || ''}
                            label={t("employeeProfile.form.city")}
                            className="w-full mt-2"
                            error={f.formState.errors.freeText}
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
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("employeeProfile.form.communicationLanguages")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="certificates"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-5"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="experience"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-5"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("employeeProfile.form.experience")}
                            code="SKILLS"
                            fullWidth
                        />
                    )}
                />

{/* TODO sort functionality... */}
                {/* <Controller
                    name="sortBy"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingSelector
                            className="w-full mt-5"
                            items={sortOptionItems}
                            value={sortOptionItems.find(i => i.value === ctx.filters.sortBy) || null}
                            onSelect={item => {
                                field.onChange(item);
                            }}
                            label={t("employeeProfile.form.sortOptions.title")}
                            fullWidth
                        ></FloatingSelector>
                    )}
                /> */}


                <div className="mt-10">
                    <Button
                        size={BtnSizes.LARGE}
                        mode={BtnModes.PRIMARY} fullWidth type="submit">
                        <FaSearch size={22}></FaSearch>
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


export default WorkersSearchFiltersView;