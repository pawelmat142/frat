import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { WorkerI } from '@shared/interfaces/WorkerProfileI';
import { WorkerService } from 'employee/services/WorkerService';
import { useAuthContext } from 'auth/AuthProvider';
import { OfferI } from '@shared/interfaces/OfferI';
import { OffersService } from 'offer/services/OffersService';
import { toast } from 'react-toastify';
import { Position } from '@shared/interfaces/MapsInterfaces';
import WebSocketService from 'global/web-socket/WebSocketService';
import { useTranslation } from 'react-i18next';
import { UserI } from '@shared/interfaces/UserI';
import { UserContextService } from './services/UserContextService';
import { defaultSettings, SettingsI } from '@shared/interfaces/SettingsI';
import { MeUserContext } from '@shared/interfaces/UserContext';
import { AuthService } from 'auth/services/AuthService';

interface UserContextType {
	me: UserI | null;
	meCtx: MeUserContext | null;
	offers: OfferI[];
	worker: WorkerI | null;
	settings: SettingsI;
	position: Position | null;

	updateMe: (user: UserI) => void;
	
	initOffers: () => void;
	cleanOffers: () => void;
	
	initWorker: () => void;
	cleanWorker: () => void;

	loading: boolean;
	setLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

	const { t } = useTranslation();
	const authCtx = useAuthContext();

	const [meCtx, setMeCtx] = useState<MeUserContext | null>(null)
	const [me, setMe] = useState<UserI | null>(null)
	const [offers, setOffers] = useState<OfferI[]>([])
	const [workerProfile, setWorkerProfile] = useState<WorkerI | null>(null)
	const [settings, setSettings] = useState<SettingsI>(defaultSettings)

	const [loading, setLoading] = useState(false)

	const [position, setPosition] = useState<Position | null>(null)
	const [positionWatchId, setPositionWatchId] = useState<number | null>(null)

	// TODO settings zmiany nie zasialaja base tez

	useEffect(() => {
		const initUserContext = async () => {
			try {
				setLoading(true);
				const ctx = await UserContextService.getMeUserContext();
				setMeCtx(ctx);
				setMe(ctx.user);
				setOffers(ctx.offers);
				setSettings(ctx.settings);
				setWorkerProfile(ctx.workerProfile || null);
				initLocation(true);
				AuthService.saveTelegramLogin(ctx.user);
			} catch (error) {
				onDestroy();
				toast.error(t('user.error.userInitError'));
			} finally {
				setLoading(false);
				WebSocketService.getInstance().connect();
			}
		}

		if (authCtx.firebaseUser) {
			initUserContext();
		} else {
			onDestroy();
		}
		return () => {
			onDestroy();
		}
	}, [authCtx.firebaseUser])

	const onDestroy = () => {
		setMe(null);
		cleanWorker()
		cleanOffers()
		cleanPosition()
		WebSocketService.getInstance().disconnect();
	}

	const updateMe = (user: UserI) => {
		setMe(user);
	}

	const initLocation = async (init?: boolean) => {
		try {
			const status = await navigator.permissions.query({ name: 'geolocation' });
			if (status.state === 'granted' || status.state === 'prompt') {

				// First, try to get a quick position (low accuracy, allow cache)
				navigator.geolocation.getCurrentPosition(
					(p) => {
						setPosition({
							lat: p.coords.latitude,
							lng: p.coords.longitude,
						});
					},
					(error) => {
						console.error("Geolocation error:", error.message);
					},
					{
						enableHighAccuracy: false,
						timeout: 5000,
						maximumAge: 300000, // Accept 5 min old cached position for quick start
					}
				);

				// Then watch for more accurate updates
				const watchId = navigator.geolocation.watchPosition(
					(p) => {
						const _position = {
							lat: p.coords.latitude,
							lng: p.coords.longitude,
						}
						setPosition(_position)
					},
					(error) => {
						if (error.code === 1) {
							locationErrorToast();
						}
						console.warn("Geolocation error:", error.message);
					},
					{
						enableHighAccuracy: true,
						timeout: 30000,           // Increased to 30s for high accuracy
						maximumAge: 60000         // Accept 1 min old position while waiting for fresh one
					}
				);
				setPositionWatchId(watchId);
			}
		} catch (error) {
			locationErrorToast();
		}
		finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const cleanPosition = () => {
		setPosition(null);
		if (positionWatchId) {
			navigator.geolocation.clearWatch(positionWatchId!);
		}
	}

	const locationErrorToast = () => {
		toast.warn(t('common.others.fetchLocationError'));
	}

	const initWorker = async (init?: boolean) => {
		try {
			setLoading(true);
			const profile = await WorkerService.getWorker();
			if (profile) {
				setWorkerProfile(profile);
			} else {
				setWorkerProfile(null);
			}
		} catch (error) {
			setWorkerProfile(null);
		}
		finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const initOffers = async (init?: boolean) => {
		try {
			setLoading(true);
			const offers = await OffersService.listMyOffers();
			if (offers) {
				setOffers(offers);
			} else {
				setOffers([]);
			}
		} catch (error) {
			setOffers([]);
		}
		finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const cleanOffers = () => {
		setOffers([]);
	}

	const cleanWorker = () => {
		setWorkerProfile(null);
	}

	return (
		<UserContext.Provider value={{
			me,
			meCtx,
			offers,
			worker: workerProfile,
			settings: settings,
			updateMe,
			initWorker: initWorker,
			cleanWorker: cleanWorker,
			initOffers: initOffers,
			cleanOffers: cleanOffers,
			loading: loading,
			setLoading: setLoading,
			position,
		}}>
			{children}
		</UserContext.Provider>
	);
};

/**
 * Hook do dostępu do kontekstu użytkownika
 */
export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUserContext must be used within UserProvider');
	}
	return context;
};