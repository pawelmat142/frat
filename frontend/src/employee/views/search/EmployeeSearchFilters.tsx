import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useEmployeeSearch } from "./EmployeeSearchProvider";

const EmployeeSearchFilters: React.FC = () => {

    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const { filters, setFilters, loading } = useEmployeeSearch();

    // Debounce effect: update RHF value after 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters({ ...filters, freeText: freeTextInput });
        }, 500);
        return () => clearTimeout(handler);
    }, [freeTextInput]);


    return (
        <div className="mb-5 flex justify-between gap-2 w-full">
            <FloatingInput
                mode={FloatingInputModes.THIN}
                name="freeText"
                value={freeTextInput}
                onChange={e => {
                    setFreeTextInput(e.target.value);
                }}
                label={t("employeeProfile.form.freeText")}
                fullWidth
                icon={<Search />}
            />

            <div className="flex items-center">
                <IconButton mode={BtnModes.PRIMARY} icon={<FilterList />} aria-label="Filters" />
            </div>
        </div>
    );
};

export default EmployeeSearchFilters;
