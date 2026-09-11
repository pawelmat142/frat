import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { useFAB } from "global/fab";
import { FABkey, FABtype } from "global/fab/useFAB";
import WorkersMapSearchResults from "./WorkersMapSearchResults";
import WorkersListSearchResults from "./WorkersListSearchResults";
import WorkersViewModeToggle from "./WorkersViewModeToggle";
import WorkersSearchFiltersView from "./WorkersSearchFiltersView";
import WorkersSearchPreview from "./WorkersSearchPreview";

type ViewMode = "list" | "map";

const WorkersSearchView: React.FC = () => {
  const ctx = useWorkersSearch();
  const { t } = useTranslation();
  const globalCtx = useGlobalContext();

  const [viewMode, setViewMode] = React.useState<ViewMode>(
    () =>
      (localStorage.getItem("workerSearchResultViewMode") as ViewMode | null) ??
      "list",
  );
  const directionRef = useRef(1);

  const toggleViewMode = () =>
    setViewMode((prev) => {
      const next: ViewMode = prev === "list" ? "map" : "list";
      directionRef.current = next === "map" ? 1 : -1;
      localStorage.setItem("workerSearchResultViewMode", next);
      return next;
    });

  useFAB(
    globalCtx.isDesktop
      ? null
      : {
          type: FABtype.filters,
          key: FABkey.workerSearch,
          component: (
            <FloatingActionButton
              onClick={() => ctx.setOpenPseudoView(true)}
              icon={<Ico.SLIDERS size={AppConfig.ICON.SIZE.FAB_BTN} />}
            />
          ),
        },
  );

  if (globalCtx.loading || !globalCtx.dics.languages) {
    return <Loading></Loading>;
  }

  const initialLoading = ctx.loading && ctx.results.length === 0;
  const noResults = !initialLoading && ctx.results.length === 0;
  const showWorkerPreview = globalCtx.isDesktop && viewMode === "list" && !!ctx.selectedWorker;

  const viewToggleBtn = (
    <WorkersViewModeToggle viewMode={viewMode} onClick={toggleViewMode} />
  );

  return (
    <>
      <Header
        title={t("employeeProfile.searchTitle")}
        rightBtn={viewToggleBtn}
      ></Header>

      <div className={`list-view workers-search-layout${showWorkerPreview ? " has-worker-preview" : ""}`}>
        {globalCtx.isDesktop && (
          <aside
            className="workers-search-sidebar"
            aria-label={t("employeeProfile.filtersTitle")}
          >
            <WorkersSearchFiltersView />
          </aside>
        )}

        <div className="workers-search-results-area">
          <div className="infinite-scroll-filters">
            <WorkersSearchFiltersBar />
          </div>

          {globalCtx.isDesktop && (
            <div className="workers-search-results-toolbar">
              <div>
                <h1 className="workers-search-results-title">
                  {t("employeeProfile.searchTitle")}
                </h1>
                {ctx.totalResults !== null && (
                  <p className="workers-search-results-count">
                    {t("employeeProfile.searchResultsCount", {
                      count: ctx.totalResults,
                      defaultValue: `${ctx.totalResults} result${ctx.totalResults === 1 ? "" : "s"}`,
                    })}
                  </p>
                )}
              </div>
                <WorkersViewModeToggle
                  viewMode={viewMode}
                  onClick={toggleViewMode}
                  label={t(
                    viewMode === "list"
                      ? "employeeProfile.showMap"
                      : "employeeProfile.showList",
                  )}
                />
            </div>
          )}

          {initialLoading ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <Loading />
            </div>
          ) : noResults ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
              <p className="xl-font mb-4 secondary-text">
                {t("common.noResults")}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={viewMode}
                className="workers-search-results-content"
                custom={directionRef.current}
                variants={{
                  enter: (d: number) => ({ x: 40 * d, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: -40 * d, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {viewMode === "map" ? (
                  <WorkersMapSearchResults />
                ) : (
                  <WorkersListSearchResults />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {showWorkerPreview && <WorkersSearchPreview worker={ctx.selectedWorker!} />}
      </div>
    </>
  );
};

export default WorkersSearchView;
