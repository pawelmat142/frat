import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { useWorkersSearch } from "./WorkersSearchProvider";
import WorkersSearchFilters from "./WorkersSearchFilters";
import { useGlobalContext } from "global/providers/GlobalProvider";
import FloatingScrollButton from "global/components/buttons/FloatingScrollButton";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import { FaUserSlash } from "react-icons/fa";
import WorkerListItem from "employee/components/WorkerListItem";

const EmployeeSearchView: React.FC = () => {

    const ctx = useWorkersSearch()
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading></Loading>
    }

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;
    const showEndOfResults = !initialLoading && !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    return (
        <div className="list-view pt-0">

            <div className="infinite-scroll-filters">
                <WorkersSearchFilters />
            </div>

            {initialLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading></Loading>
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (
                <div className="results flex flex-col gap-1">
                    {(ctx.results ?? []).map((profile, index) => (
                        <WorkerListItem
                            key={index}
                            profile={profile}
                            languagesDictionary={globalCtx.dics.languages!}
                            first={index === 0}
                            last={index === (ctx.results?.length ?? 0) - 1}
                        ></WorkerListItem>
                    ))}
                    <InfiniteScrollEventEmitter emitEvent={ctx.loadMore} />
                </div>
            )}

            {ctx.loadingMore && ctx.results.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading></Loading>
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text s-font">{t('common.endOfResults', { defaultValue: 'No more profiles to display.' })}</span>
                </div>
            )}

            <FloatingScrollButton />
        </div>

    )
}


export default EmployeeSearchView;