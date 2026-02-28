import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { WorkerI } from '@shared/interfaces/WorkerProfileI';
import { WorkerService } from 'employee/services/WorkerService';
import { useAuthContext } from 'auth/AuthProvider';
import { OfferI } from '@shared/interfaces/OfferI';
import { OffersService } from 'offer/services/OffersService';
import { toast } from 'react-toastify';
import { Position } from '@shared/interfaces/MapsInterfaces';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { FriendsService } from 'friends/services/FriendsService';
import { friendsSocket } from 'friends/services/FriendsSocketService';
import WebSocketService from 'global/web-socket/WebSocketService';
import { useTranslation } from 'react-i18next';
import { UserI } from '@shared/interfaces/UserI';
import { UserContextService } from './services/UserContextService';
import { defaultSettings, SettingsI } from '@shared/interfaces/SettingsI';
import { MeUserContext } from '@shared/interfaces/UserContext';

interface UserContextType {
	me: UserI | null;
	friendships: FriendshipI[];
	offers: OfferI[];
	worker: WorkerI | null;
	settings: SettingsI;
	position: Position | null;

	initFriendships: () => void;
	cleanFriendships: () => void;
	putFriendship: (friendship: FriendshipI) => void;
	
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

	const [loading, setLoading] = useState(false)

	const [position, setPosition] = useState<Position | null>(null)
	const [positionWatchId, setPositionWatchId] = useState<number | null>(null)

	// TODO usunac me z authctx 
	// TODO chaty i notyfikacje zasilac na bazie meCtx
	// TODO settings zmiany nie zasialaja base tez

	useEffect(() => {
		const initUserContext = async () => {
			try {
				setLoading(true);
				const ctx = await UserContextService.getMeUserContext();
				setMeCtx(ctx);
				initLocation(true);
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
		unregisterFriendshipListeners();
		cleanWorker()
		cleanOffers()
		cleanPosition()
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
				setMeCtx(prev => prev ? { ...prev, workerProfile: profile } : null);
			} else {
				setMeCtx(prev => prev ? { ...prev, workerProfile: undefined } : null);
			}
		} catch (error) {
			setMeCtx(prev => prev ? { ...prev, workerProfile: undefined } : null);
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
				setMeCtx(prev => prev ? { ...prev, offers: offers } : null);
			} else {
				setMeCtx(prev => prev ? { ...prev, offers: [] } : null);
			}
		} catch (error) {
			setMeCtx(prev => prev ? { ...prev, offers: [] } : null);
		}
		finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const initFriendships = async (init?: boolean) => {
		try {
			setLoading(true);
			const friendships = await FriendsService.getFriendships(authCtx.me!.uid);
			if (friendships) {
				setMeCtx(prev => prev ? { ...prev, friendships: friendships } : null);
			} else {
				setMeCtx(prev => prev ? { ...prev, friendships: [] } : null);
			}
			registerFriendshipListeners();
		} catch (error) {
			setMeCtx(prev => prev ? { ...prev, friendships: [] } : null);
		} finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const registerFriendshipListeners = () => {
		friendsSocket.registerInviteListener(onInviteFriend);
		friendsSocket.registerRejectListener(onRejectInvite);
		friendsSocket.registerAcceptListener(onAcceptInvite);
		friendsSocket.registerRemoveListener(onRemoveFriend);
	}

	const unregisterFriendshipListeners = () => {
		friendsSocket.unregisterInviteListener(onInviteFriend);
		friendsSocket.unregisterRejectListener(onRejectInvite);
		friendsSocket.unregisterAcceptListener(onAcceptInvite);
		friendsSocket.unregisterRemoveListener(onRemoveFriend);
	}

	const onInviteFriend = (friendship: FriendshipI) => {
		const exists = meCtx?.friendships.find(f => f.friendshipId === friendship.friendshipId);
		if (!exists) {
			setMeCtx(prev => prev ? { ...prev, friendships: [...prev.friendships, friendship] } : null);
		} else {
			setMeCtx(prev => prev ? { ...prev, friendships: prev.friendships.map(f => f.friendshipId === friendship.friendshipId ? friendship : f) } : null);
		}
	}

	const onRejectInvite = (friendship: FriendshipI) => {
		const newFriendships = meCtx?.friendships.map(f => {
			if (f.friendshipId === friendship.friendshipId) {
				return friendship;
			}
			return f
		}) ?? [];
		setMeCtx(prev => prev ? { ...prev, friendships: newFriendships } : null);
	}

	const onAcceptInvite = (friendship: FriendshipI) => {
		const newFriendships = meCtx?.friendships.filter(f => f.friendshipId !== friendship.friendshipId) ?? [];
		newFriendships.push(friendship);
		setMeCtx(prev => prev ? { ...prev, friendships: newFriendships } : null);
	}

	const putFriendship = (friendship: FriendshipI) => {
		const exists = meCtx?.friendships.find(f => f.friendshipId === friendship.friendshipId);
		if (exists) {
			setMeCtx(prev => prev ? { ...prev, friendships: prev.friendships.map(f => f.friendshipId === friendship.friendshipId ? friendship : f) } : null);
		} else {
			setMeCtx(prev => prev ? { ...prev, friendships: [...prev.friendships, friendship] } : null);
		}
	}

	const onRemoveFriend = (friendship: FriendshipI) => {
		const newFriendships = meCtx?.friendships.filter(f => f.friendshipId !== friendship.friendshipId) ?? [];
		setMeCtx(prev => prev ? { ...prev, friendships: newFriendships } : null);
	}

	const cleanOffers = () => {
		setMeCtx(prev => prev ? { ...prev, offers: [] } : null);
	}

	const cleanWorker = () => {
		setMeCtx(prev => prev ? { ...prev, workerProfile: undefined } : null);
	}

	const cleanFriendships = () => {
		setMeCtx(prev => prev ? { ...prev, friendships: [] } : null);
	}

	return (
		<UserContext.Provider value={{
			me: meCtx?.user ?? null,
			friendships: meCtx?.friendships ?? [],
			offers: meCtx?.offers ?? [],
			worker: meCtx?.workerProfile ?? null,
			settings: meCtx ? meCtx.settings : defaultSettings,
			initWorker: initWorker,
			cleanWorker: cleanWorker,
			initOffers: initOffers,
			cleanOffers: cleanOffers,
			initFriendships: initFriendships,
			cleanFriendships: cleanFriendships,
			putFriendship: putFriendship,
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