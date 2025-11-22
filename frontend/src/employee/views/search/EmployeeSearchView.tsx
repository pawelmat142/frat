import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EmployeeProfileTile from "employee/components/EmployeeProfileTile";
import { DictionaryService } from "global/services/DictionaryService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";
import { BtnModes } from "global/interface/controls.interface";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import EmployeeSearchFilters from "./EmployeeSearchFilters";

const EmployeeSearchView: React.FC = () => {

    // TODO opcje sortowania na widoku
    // TODO implementacja sortowanie w backendzie
    // TODO sensowne indexy na searach
    // TODO desktop RWD adjustment

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);
    const { results, loading, setLoading, pagination, nextPage, prevPage } = useEmployeeSearch();
    const { t } = useTranslation();

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            const dictionary = await DictionaryService.getDictionary('LANGUAGES');
            setLanguagesDictionary(dictionary);
            setLoading(false);
        }
        initDictionary();
    }, []);

    return (
        <div className="list-view">

            <EmployeeSearchFilters languagesDictionary={languagesDictionary} />

            {!loading && !results.length ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : <div className="results flex flex-col gap-1">
                {!!languagesDictionary && results.map((profile, index) => (
                    <EmployeeProfileTile
                        key={profile.employeeProfileId}
                        employeeProfile={profile}
                        languagesDictionary={languagesDictionary}
                        first={index === 0}
                        last={index === results.length - 1}
                    />
                ))}
            </div>}

            {loading ? (<div>
                <Loading></Loading>
            </div>) : (
                <div className="flex-[2] flex justify-center items-center gap-4 mt-5 mb-10">
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => prevPage()}
                        disabled={pagination.currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="secondary-text whitespace-nowrap">
                        Page {pagination.currentPage} of {pagination.totalPages} ({pagination.count} items)
                    </span>
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => nextPage()}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
            <div></div>
        </div>

    )
}


export default EmployeeSearchView;