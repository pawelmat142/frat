import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import EmployeeProfileTile from "employee/components/EmployeeProfileTile";
import { DictionaryService } from "global/services/DictionaryService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";
import { BtnModes } from "global/interface/controls.interface";
import EmployeeSearchProvider, { useEmployeeSearch } from "./EmployeeSearchProvider";
import EmployeeSearchFilters from "./EmployeeSearchFilters";

const EmployeeSearchViewContent: React.FC = () => {

    // TODO opcje sortowania na widoku
    // TODO implementacja sortowanie w backendzie
    // TODO szukanie po krajach, lokacji/odległości
    // TODO sensowne indexy na searach

    const { t } = useTranslation();
    const { me } = useAuthContext()
    const { filters, setFilters, results, loading, setLoading, pagination, nextPage, prevPage } = useEmployeeSearch();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);

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

            <div className="results flex flex-col gap-1">
                {!!languagesDictionary && results.map((profile, index) => (
                    <EmployeeProfileTile
                        key={profile.employeeProfileId}
                        employeeProfile={profile}
                        languagesDictionary={languagesDictionary}
                        first={index === 0}
                        last={index === results.length - 1}
                    />
                ))}
            </div>

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

const EmployeeSearchView: React.FC = () => (
    <EmployeeSearchProvider>
        <EmployeeSearchViewContent />
    </EmployeeSearchProvider>
);

export default EmployeeSearchView;