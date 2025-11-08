import React, { createContext, useContext, ReactNode } from 'react';
import { EmployeeProfileI } from '@shared/interfaces/EmployeeProfileI';
import { EmployeeProfileService } from 'employee/services/EmployeeProfileService';
import { useAuthContext } from 'auth/AuthProvider';

interface UserContextType {
	employeeProfile: EmployeeProfileI | null;
	initEmployeeProfile: () => void;
	cleanEmployeeProfile: () => void;
	loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

	const [employeeProfile, setEmployeeProfile] = React.useState<EmployeeProfileI | null>(null);
	const [loading, setLoading] = React.useState(false);

	const { me } = useAuthContext();

	const initEmployeeProfile = async () => {
		try {
			setLoading(true);
			console.log("Fetching employee profile in UserProvider for user:", me);
			const profile = await EmployeeProfileService.getEmployeeProfile();
			if (profile) {
				setEmployeeProfile(profile);
			} else {
				setEmployeeProfile(null);
			}
		} catch (error) {
			setEmployeeProfile(null);
		} finally {
			setLoading(false);
		}
	}

	const cleanEmployeeProfile = () => {
		console.log("Cleaning employee profile in UserProvider for user:", me);
		setEmployeeProfile(null);
	}

	React.useEffect(() => {
		if (me) {
			initEmployeeProfile();
		} else {
			cleanEmployeeProfile();
		}
	}, [me]);

	return (
		<UserContext.Provider value={{
			employeeProfile: employeeProfile,
			initEmployeeProfile: initEmployeeProfile,
			cleanEmployeeProfile: cleanEmployeeProfile,
			loading: loading
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