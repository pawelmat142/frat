import React, { createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useAuth } from 'auth/useAuth';
import { UserI } from '@shared/interfaces/UserI';

interface AuthContextType {
	firebaseUser: FirebaseUser | null;
    userI: UserI | null;
	loading: boolean;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const auth = useAuth();

	return (
		<AuthContext.Provider value={auth}>
			{children}
		</AuthContext.Provider>
	);
};

/**
 * Hook do dostępu do kontekstu autoryzacji
 * Użycie: const { user, loading, isAuthenticated } = useAuthContext();
 */
export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuthContext must be used within AuthProvider');
	}
	return context;
};
