import React, { createContext, useContext, ReactNode } from 'react';
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
import { useTranslation } from 'react-i18next';
import WebSocketService from 'global/web-socket/WebSocketService';

interface UserContextType {
	worker: WorkerI | null;
	position: Position | null;
	initWorker: () => void;
	cleanWorker: () => void;
	offers: OfferI[];
	initOffers: () => void;
	cleanOffers: () => void;
	friendships: FriendshipI[];
	initFriendships: () => void;
	cleanFriendships: () => void;
	putFriendship: (friendship: FriendshipI) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

	const [worker, setWorker] = React.useState<WorkerI | null>(null)

	const [offers, setOffers] = React.useState<OfferI[]>([])

	const [friendships, setFriendships] = React.useState<FriendshipI[]>([])

	const [loading, setLoading] = React.useState(false)

	const [position, setPosition] = React.useState<Position | null>(null)
	const [positionWatchId, setPositionWatchId] = React.useState<number | null>(null)

	const authCtx = useAuthContext();
	const { t } = useTranslation()

	React.useEffect(() => {
		if (authCtx.me) {
			Promise.all([
				initWorker(true),
				initOffers(true),
				initLocation(true),
				initFriendships(true),
			]).then(() => {
				setLoading(false);
				WebSocketService.getInstance().connect();
			})
		} else {
			unregisterFriendshipListeners();
			cleanWorker()
			cleanOffers()
			cleanPosition()
		}
	}, [authCtx.me]);

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
		// TODO transaltion
		toast.warn('Could not fetch location');
	}

	const initWorker = async (init?: boolean) => {
		try {
			setLoading(true);
			const profile = await WorkerService.getWorker();
			if (profile) {
				setWorker(profile);
			} else {
				setWorker(null);
			}
		} catch (error) {
			setWorker(null);
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

	const initFriendships = async (init?: boolean) => {
		try {
			setLoading(true);
			const friendships = await FriendsService.getFriendships(authCtx.me!.uid);
			if (friendships) {
				setFriendships(friendships);
			} else {
				setFriendships([]);
			}
			registerFriendshipListeners();
		} catch (error) {
			setFriendships([]);
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
		const exists = friendships.find(f => f.friendshipId === friendship.friendshipId)
		if (!exists) {
			setFriendships(prev => [...prev, friendship])
		} else {
			setFriendships(prev => prev.map(f => f.friendshipId === friendship.friendshipId ? friendship : f))
		}
		// TODO notifications feature
		toast.info(t('friends.inviteReceivedToast', { name: friendship.requesterName }))
	}

	const onRejectInvite = (friendship: FriendshipI) => {
		const newFriendships = friendships.map(f => {
			if (f.friendshipId === friendship.friendshipId) {
				return friendship;
			}
			return f
		})
		setFriendships(newFriendships)
	}

	const onAcceptInvite = (friendship: FriendshipI) => {
		const newFriendships = friendships.filter(f => f.friendshipId !== friendship.friendshipId);
		newFriendships.push(friendship);
		setFriendships(newFriendships)
		if (friendship.requesterUid === authCtx.me!.uid) {
			toast.info(t('friends.inviteAcceptedToast', { name: friendship.addresseeName }));
		}
	}

	const putFriendship = (friendship: FriendshipI) => {
		const exists = friendships.find(f => f.friendshipId === friendship.friendshipId);
		if (exists) {
			setFriendships(prev => prev.map(f => f.friendshipId === friendship.friendshipId ? friendship : f));
		} else {
			setFriendships(prev => [...prev, friendship]);
		}
	}

	const onRemoveFriend = (friendship: FriendshipI) => {
		const newFriendships = friendships.filter(f => f.friendshipId !== friendship.friendshipId);
		setFriendships(newFriendships)
	}

	const cleanOffers = () => {
		setOffers([]);
	}

	const cleanWorker = () => {
		setWorker(null);
	}

	const cleanFriendships = () => {
		setFriendships([]);
	}

	return (
		<UserContext.Provider value={{
			worker: worker,
			initWorker: initWorker,
			cleanWorker: cleanWorker,
			offers: offers,
			initOffers: initOffers,
			cleanOffers: cleanOffers,
			friendships: friendships,
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