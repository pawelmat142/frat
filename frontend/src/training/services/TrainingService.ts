import { TrainingProviderProfileI, TrainingSearchFilters, TrainingSearchResponse, TrainingI, TrainingSessionI, TrainingWithNextSession } from "@shared/interfaces/TrainingI";
import { httpClient } from "global/services/http";

export const TrainingService = {

    // ─── Public ───────────────────────────────────────────────────────────────

    searchTrainings(filters: TrainingSearchFilters): Promise<TrainingSearchResponse> {
        return httpClient.get<TrainingSearchResponse>(`/trainings/search`, { params: filters });
    },

    getTrainingById(trainingId: number): Promise<TrainingWithNextSession> {
        return httpClient.get<TrainingWithNextSession>(`/trainings/${trainingId}`);
    },

    listSessions(trainingId: number): Promise<TrainingSessionI[]> {
        return httpClient.get<TrainingSessionI[]>(`/trainings/${trainingId}/sessions`);
    },

    // ─── TRAINING_PROVIDER ────────────────────────────────────────────────────

    listMyTrainings(): Promise<TrainingI[]> {
        return httpClient.get<TrainingI[]>(`/trainings`);
    },

    createTraining(data: Partial<TrainingI> & { providerId: number }): Promise<TrainingI> {
        return httpClient.post<TrainingI>(`/trainings`, data);
    },

    updateTraining(trainingId: number, data: Partial<TrainingI>): Promise<TrainingI> {
        return httpClient.patch<TrainingI>(`/trainings/${trainingId}`, data);
    },

    toggleActivation(trainingId: number): Promise<TrainingI> {
        return httpClient.patch<TrainingI>(`/trainings/${trainingId}/activation`, {});
    },

    deleteTraining(trainingId: number): Promise<void> {
        return httpClient.delete<void>(`/trainings/${trainingId}`);
    },

    createSession(trainingId: number, data: Partial<TrainingSessionI>): Promise<TrainingSessionI> {
        return httpClient.post<TrainingSessionI>(`/trainings/${trainingId}/sessions`, data);
    },

    updateSession(trainingId: number, sessionId: number, data: Partial<TrainingSessionI>): Promise<TrainingSessionI> {
        return httpClient.patch<TrainingSessionI>(`/trainings/${trainingId}/sessions/${sessionId}`, data);
    },

    deleteSession(trainingId: number, sessionId: number): Promise<void> {
        return httpClient.delete<void>(`/trainings/${trainingId}/sessions/${sessionId}`);
    },

    // ─── Training Provider profile ────────────────────────────────────────────

    getMyProviderProfile(): Promise<TrainingProviderProfileI> {
        return httpClient.get<TrainingProviderProfileI>(`/training-providers/me`);
    },

    getProviderProfile(providerId: number): Promise<TrainingProviderProfileI> {
        return httpClient.get<TrainingProviderProfileI>(`/training-providers/${providerId}`);
    },

    createProviderProfile(data: Partial<TrainingProviderProfileI>): Promise<TrainingProviderProfileI> {
        return httpClient.post<TrainingProviderProfileI>(`/training-providers`, data);
    },

    updateProviderProfile(data: Partial<TrainingProviderProfileI>): Promise<TrainingProviderProfileI> {
        return httpClient.patch<TrainingProviderProfileI>(`/training-providers/me`, data);
    },
};
