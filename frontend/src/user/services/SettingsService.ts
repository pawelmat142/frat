import { SettingsI } from "@shared/interfaces/SettingsI";
import { httpClient } from "global/services/http";

export const SettingsService = {

    updateSettings: async (settings: SettingsI): Promise<SettingsI> => {
        return httpClient.patch<SettingsI>(`/settings`, settings);
    },
    
}