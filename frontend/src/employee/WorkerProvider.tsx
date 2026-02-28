import React, { createContext, useContext, useEffect, useState } from "react";
import { WorkerI } from "@shared/interfaces/WorkerProfileI";
import { WorkerService } from "employee/services/WorkerService";
import { useUserContext } from "user/UserProvider";

interface WorkerContextType {
    worker: WorkerI | null;
    initWorker: () => Promise<void>;
    cleanWorker: () => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const userCtx = useUserContext();
    const { me, meCtx } = userCtx;

    const [worker, setWorker] = useState<WorkerI | null>(null);

    useEffect(() => {
        if (me) {
            onInit();
        } else {
            onDestroy();
        }
        return () => onDestroy();
    }, [me]);

    const onInit = () => {
        setWorker(meCtx?.workerProfile || null);
    };

    const onDestroy = () => {
        setWorker(null);
    };

    const initWorker = async () => {
        try {
            const result = await WorkerService.getWorker();
            setWorker(result || null);
        } catch {
            setWorker(null);
        }
    };

    const cleanWorker = () => {
        setWorker(null);
    };

    return (
        <WorkerContext.Provider value={{
            worker,
            initWorker,
            cleanWorker,
        }}>
            {children}
        </WorkerContext.Provider>
    );
};

export const useWorkerContext = (): WorkerContextType => {
    const context = useContext(WorkerContext);
    if (!context) {
        throw new Error("useWorkerContext must be used within WorkerProvider");
    }
    return context;
};
