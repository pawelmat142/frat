import React, { createContext, useContext, useEffect, useState } from "react";
import { OfferI } from "@shared/interfaces/OfferI";
import { OffersService } from "offer/services/OffersService";
import { useUserContext } from "user/UserProvider";

interface OffersContextType {
    offers: OfferI[];
    initOffers: () => Promise<void>;
    cleanOffers: () => void;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export const OffersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const userCtx = useUserContext();
    const { me, meCtx } = userCtx;

    const [offers, setOffers] = useState<OfferI[]>([]);

    useEffect(() => {
        if (me) {
            onInit();
        } else {
            onDestroy();
        }
        return () => onDestroy();
    }, [me]);

    const onInit = () => {
        setOffers(meCtx?.offers || []);
    };

    const onDestroy = () => {
        setOffers([]);
    };

    const initOffers = async () => {
        try {
            const result = await OffersService.listMyOffers();
            setOffers(result || []);
        } catch {
            setOffers([]);
        }
    };

    const cleanOffers = () => {
        setOffers([]);
    };

    return (
        <OffersContext.Provider value={{
            offers,
            initOffers,
            cleanOffers,
        }}>
            {children}
        </OffersContext.Provider>
    );
};

export const useOffersContext = (): OffersContextType => {
    const context = useContext(OffersContext);
    if (!context) {
        throw new Error("useOffersContext must be used within OffersProvider");
    }
    return context;
};
