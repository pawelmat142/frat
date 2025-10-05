import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from 'auth/AuthProvider';
import { Path } from './../path';

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
}

// TODO uzycia potestowac i zaimplementowac
/**
 * Komponent zabezpieczający route - wymaga autoryzacji
 * Użycie:
 * <ProtectedRoute redirectTo="/login">
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
	children, 
	redirectTo = Path.SIGN_IN 
}) => {
	const { isAuthenticated, loading } = useAuthContext();

	if (loading) {
		return <div>Loading...</div>; // Możesz użyć własnego loadera
	}

	if (!isAuthenticated) {
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
};
