import React, { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTrainingSearch } from "./TrainingSearchProvider";
import TrainingListItem from "training/components/TrainingListItem";
import TrainingSearchFilters from "./TrainingSearchFilters";
import Loading from "global/components/Loading";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import PseudoView from "global/components/PseudoView";
import TrainingSearchFiltersView from "./TrainingSearchFiltersView";
import { Ico } from "global/icon.def";
import { AppConfig } from "@shared/AppConfig";
import Header from "global/components/Header";

const TrainingSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useTrainingSearch();
    const fabId = useId();

    useEffect(() => {
        globalCtx.setFloatingButton(
            <FloatingActionButton
                forceVisible={!ctx.openPseudoView}
                onClick={() => ctx.setOpenPseudoView(true)}
                icon={<Ico.SLIDERS size={AppConfig.FAB_BTN_ICON_SIZE} />}
            />,
            fabId,
        );
    }, [ctx.openPseudoView]);

    useEffect(() => {
        return () => globalCtx.setFloatingButton(null);
    }, []);

    if (globalCtx.loading) {
        return <Loading />;
    }

    return (
        <div className="view-container">
            <Header title={t("training.searchTitle")} />

            <TrainingSearchFilters />

            {ctx.loading && <Loading />}

            {!ctx.loading && !ctx.results.length && (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Ico.EMPTY size={40} className="secondary-text mb-4" />
                    <p className="xl-font secondary-text">{t("training.noResults")}</p>
                </div>
            )}

            {!ctx.loading && ctx.results.map((training, i) => (
                <TrainingListItem
                    key={training.trainingId}
                    training={training}
                    first={i === 0}
                    last={i === ctx.results.length - 1 && !ctx.hasMore}
                />
            ))}

            {ctx.hasMore && (
                <InfiniteScrollEventEmitter emitEvent={ctx.loadMore} />
            )}

            <PseudoView show={ctx.openPseudoView}>
                <TrainingSearchFiltersView onClose={() => ctx.setOpenPseudoView(false)} />
            </PseudoView>
        </div>
    );
};

export default TrainingSearchView;
