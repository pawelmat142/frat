import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { WorkerSearchFilters } from "@shared/interfaces/WorkerI";
import { WorkerUtil } from "@shared/utils/WorkerUtil";

interface UseAutoApplyWorkerFiltersOptions {
    enabled: boolean;
    form: UseFormReturn<WorkerSearchFilters>;
    formFilters: WorkerSearchFilters;
    appliedFilters: WorkerSearchFilters;
    defaultFilters: WorkerSearchFilters;
    onApply: (filters: WorkerSearchFilters) => void;
    debounceMs?: number;
}

export const useAutoApplyWorkerFilters = ({
    enabled,
    form,
    formFilters,
    appliedFilters,
    defaultFilters,
    onApply,
    debounceMs = 300,
}: UseAutoApplyWorkerFiltersOptions) => {
    const formSearchParams = WorkerUtil.prepareUrlParams(formFilters, defaultFilters);
    const appliedSearchParams = WorkerUtil.prepareUrlParams(appliedFilters, defaultFilters);
    const hasRequiredFilters = !!formFilters.startDate && !!formFilters.locationCountry;

    useEffect(() => {
        if (!enabled || !hasRequiredFilters) return;
        if (formSearchParams === appliedSearchParams) return;

        const timeout = window.setTimeout(() => {
            onApply(form.getValues());
        }, debounceMs);

        return () => window.clearTimeout(timeout);
    }, [appliedSearchParams, debounceMs, enabled, form, formSearchParams, hasRequiredFilters, onApply]);
};