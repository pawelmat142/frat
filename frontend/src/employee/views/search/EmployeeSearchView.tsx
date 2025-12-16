import { useTranslation } from "react-i18next";
import EmployeeProfileTile from "employee/components/EmployeeProfileTile";
import Loading from "global/components/Loading";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import EmployeeSearchFilters from "./EmployeeSearchFilters";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useInfiniteScroll } from "shared/hooks/useInfiniteScroll";
import FloatingScrollTopButton from "global/components/buttons/FloatingScrollTopButton";

const EmployeeSearchView: React.FC = () => {

    const ctx = useEmployeeSearch()
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()

    const sentinelRef = useInfiniteScroll({
        hasMore: ctx.hasMore,
        isLoading: ctx.loading || ctx.loadingMore,
        onLoadMore: ctx.loadMore,
    });

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (
            <div>
                <Loading></Loading>
            </div>
        )
    }

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;
    const showEndOfResults = !initialLoading && !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    return (
        <div className="list-view pt-0">

            <div className="infinite-scroll-filters">
                <EmployeeSearchFilters />
            </div>

            {initialLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading></Loading>
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (
                <div className="results flex flex-col gap-1">
                    {(ctx.results ?? []).map((profile, index) => (
                        <EmployeeProfileTile
                            key={profile.employeeProfileId}
                            profile={profile}
                            languagesDictionary={globalCtx.dics.languages!}
                            first={index === 0}
                            last={index === (ctx.results?.length ?? 0) - 1}
                        />
                    ))}
                    <div ref={sentinelRef} className="h-1" aria-hidden="true"></div>
                </div>
            )}

            {ctx.loadingMore && ctx.results.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading></Loading>
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text small-font">{t('common.endOfResults', { defaultValue: 'No more profiles to display.' })}</span>
                </div>
            )}

            <FloatingScrollTopButton />
        </div>

    )
}


export default EmployeeSearchView;