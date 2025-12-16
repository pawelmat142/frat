import { useTranslation } from "react-i18next";
import EmployeeProfileTile from "employee/components/EmployeeProfileTile";
import Loading from "global/components/Loading";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import EmployeeSearchFilters from "./EmployeeSearchFilters";
import { useGlobalContext } from "global/providers/GlobalProvider";
import Pagination from "global/components/controls/Pagination";

const EmployeeSearchView: React.FC = () => {

    const ctx = useEmployeeSearch()
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (<div>
            <Loading></Loading>
        </div>)
    }

    return (
        <div className="list-view">

            <EmployeeSearchFilters />

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
                <Pagination
                    pagination={ctx.pagination}
                    onPrev={ctx.prevPage}
                    onNext={ctx.nextPage}
                ></Pagination>
            )}
        </div>

    )
}


export default EmployeeSearchView;