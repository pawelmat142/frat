import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import React from "react";
import { useTranslation } from "react-i18next";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";

interface AvailabilityTileProps {
    profile: EmployeeProfileI
    languagesDictionary?: DictionaryI | null
}

const AvailabilityTile: React.FC<AvailabilityTileProps> = ({ profile, languagesDictionary }) => {
    const { t } = useTranslation();


    if (!languagesDictionary) {
        return (<Loading></Loading>);
    }

    return (
        <div className="square-tile data-tile p-1">

            <div>{t('employeeProfile.availability')}</div>

        </div>
    );
}

export default AvailabilityTile;