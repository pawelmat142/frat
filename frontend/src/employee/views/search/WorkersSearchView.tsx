import React from "react";
import { useTranslation } from "react-i18next";
import { FaUserSlash } from "react-icons/fa";
import Loading from "global/components/Loading";
import { useWorkersSearch } from "./WorkersSearchProvider";
import WorkersSearchFiltersBar from "./WorkersSearchFiltersBar";
import { useGlobalContext } from "global/providers/GlobalProvider";
import FloatingActionButton from "global/fab/FloatingActionButton";
import { Ico } from "global/icon.def";
import { AppConfig } from "@shared/AppConfig";
import Header from "global/components/Header";
import IconButton from "global/components/controls/IconButon";
import { BtnModes } from "global/interface/controls.interface";
import { useFAB } from "global/fab";
import { FABkey, FABtype } from "global/fab/useFAB";
import WorkersMapSearchResults from "./WorkersMapSearchResults";
import WorkersListSearchResults from "./WorkersListSearchResults";

type ViewMode = 'list' | 'map';

const WorkersSearchView: React.FC = () => {

    const ctx = useWorkersSearch()
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()

    const [viewMode, setViewMode] = React.useState<ViewMode>(
        () => (localStorage.getItem('workerSearchResultViewMode') as ViewMode | null) ?? 'list'
    );

    const toggleViewMode = () => setViewMode(prev => {
        const next: ViewMode = prev === 'list' ? 'map' : 'list';
        localStorage.setItem('workerSearchResultViewMode', next);
        return next;
    });

    useFAB({
        type: FABtype.filters,
        key: FABkey.workerSearch,
        component: <FloatingActionButton
            onClick={() => ctx.setOpenPseudoView(true)}
            icon={<Ico.SLIDERS size={AppConfig.FAB_BTN_ICON_SIZE} />}
        />,
    });

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading></Loading>
    }

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;

    const viewToggleBtn = (
        <IconButton
            mode={BtnModes.PRIMARY_TXT}
            icon={viewMode === 'list' ? <Ico.MAP size={20} /> : <Ico.LIST size={20} />}
            onClick={toggleViewMode}
        />
    );

    return (<>
        <Header title={t('employeeProfile.searchTitle')} rightBtn={viewToggleBtn}></Header>

        <div className="list-view pt-0">

            <div className="infinite-scroll-filters">
                <WorkersSearchFiltersBar />
            </div>

            {initialLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading />
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : viewMode === 'map' ? (
                <WorkersMapSearchResults />
            ) : (
                <WorkersListSearchResults />
            )}

        </div>
    </>

    )
}


export default WorkersSearchView;