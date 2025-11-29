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
import { useGlobalContext } from "global/providers/GlobalProvider";

const EmployeeSearchView: React.FC = () => {

    // TODO opcje sortowania na widoku
    // TODO implementacja sortowanie w backendzie
    // TODO sensowne indexy na searach
    // TODO desktop RWD adjustment

    const ctx = useEmployeeSearch();
    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (<div>
            <Loading></Loading>
        </div>)
    }

    return (
        <div className="list-view">

            <EmployeeSearchFilters languagesDictionary={globalCtx.dics.languages} />

            {!ctx.loading && !ctx.results.length ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : <div className="results flex flex-col gap-1">
                {!!globalCtx.dics.languages && ctx.results.map((profile, index) => (
                    <EmployeeProfileTile
                        key={profile.employeeProfileId}
                        profile={profile}
                        languagesDictionary={globalCtx.dics.languages!}
                        first={index === 0}
                        last={index === ctx.results.length - 1}
                    />
                ))}
            </div>}

            {ctx.loading ? (<div>
                <Loading></Loading>
            </div>) : (
                <div className="flex-[2] flex justify-center items-center gap-4 mt-5 mb-10">
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => ctx.prevPage()}
                        disabled={ctx.pagination.currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="secondary-text whitespace-nowrap">
                        Page {ctx.pagination.currentPage} of {ctx.pagination.totalPages} ({ctx.pagination.count} items)
                    </span>
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => ctx.nextPage()}
                        disabled={ctx.pagination.currentPage === ctx.pagination.totalPages}
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