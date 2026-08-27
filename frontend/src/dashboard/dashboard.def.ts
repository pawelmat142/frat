import { AppConfig } from "@shared/AppConfig";

export const getDashboardLimit = (isDesktop: boolean) => (
    isDesktop
        ? AppConfig.DASHBOARD.DESKTOP_LIMIT
        : AppConfig.DASHBOARD.MOBILE_LIMIT
);
