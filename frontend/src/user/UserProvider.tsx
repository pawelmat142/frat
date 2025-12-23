import React, { createContext, useContext, ReactNode } from 'react';
import { EmployeeProfileI, Position } from '@shared/interfaces/EmployeeProfileI';
import { EmployeeProfileService } from 'employee/services/EmployeeProfileService';
import { useAuthContext } from 'auth/AuthProvider';
import { OfferI } from '@shared/interfaces/OfferI';
import { OffersService } from 'offer/services/OffersService';
import { toast } from 'react-toastify';

interface UserContextType {
	employeeProfile: EmployeeProfileI | null;
	position: Position | null;
	initEmployeeProfile: () => void;
	cleanEmployeeProfile: () => void;
	offers: OfferI[];
	initOffers: () => void;
	cleanOffers: () => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

	const [employeeProfile, setEmployeeProfile] = React.useState<EmployeeProfileI | null>(null);

	const [offers, setOffers] = React.useState<OfferI[]>([]);

	const [loading, setLoading] = React.useState(false);

	const [position, setPosition] = React.useState<Position | null>(null);
	const [positionWatchId, setPositionWatchId] = React.useState<number | null>(null);

	const { me } = useAuthContext();

	React.useEffect(() => {
		if (me) {
			Promise.all([
				initEmployeeProfile(),
				initOffers(),
				initLocation(),
			]).then(() => {
				setLoading(false);
			})
		} else {
			cleanEmployeeProfile()
			cleanOffers()
			cleanPosition()
		}
	}, [me]);

	const initLocation = async () => {
		try {
			const status = await navigator.permissions.query({ name: 'geolocation' });
			if (status.state === 'granted' || status.state === 'prompt') {

				const watchId = navigator.geolocation.watchPosition(
					(p) => {
						const _position = {
							lat: p.coords.latitude,
							lng: p.coords.longitude,
						}
						setPosition(_position)
					},
					(error) => {
						locationErrorToast();
						console.error("Error fetching position:", error);
					}
				);
				setPositionWatchId(watchId);
			}
		} catch (error) {
			locationErrorToast();
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


	const initEmployeeProfile = async () => {
		try {
			setLoading(true);
			const profile = await EmployeeProfileService.getEmployeeProfile();
			console.log("Fetched employee profile:", profile);
			if (profile) {
				setEmployeeProfile(profile);
			} else {
				setEmployeeProfile(null);
			}
		} catch (error) {
			setEmployeeProfile(null);
		}
	}

	const initOffers = async () => {
		try {
			setLoading(true);
			const offers = await OffersService.listMyOffers();
			console.log("Fetched user offers:", offers);
			if (offers) {
				setOffers(offers);
			} else {
				setOffers([]);
			}
		} catch (error) {
			setOffers([]);
		}
	}

	const cleanOffers = () => {
		console.log("Cleaning offers in UserProvider for user:", me);
		setOffers([]);
	}

	const cleanEmployeeProfile = () => {
		console.log("Cleaning employee profile in UserProvider for user:", me);
		setEmployeeProfile(null);
	}


	return (
		<UserContext.Provider value={{
			employeeProfile: employeeProfile,
			initEmployeeProfile: initEmployeeProfile,
			cleanEmployeeProfile: cleanEmployeeProfile,
			offers: offers,
			initOffers: initOffers,
			cleanOffers: cleanOffers,
			loading: loading,
			setLoading: setLoading,
			position
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