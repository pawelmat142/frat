import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from 'auth/AuthProvider';
import { Path } from './../path';
import Loading from 'global/components/Loading';
import { UserRole } from '@shared/interfaces/UserI';
import { Util } from '@shared/utils/util';

interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string;
	roles?: UserRole[];
}

/**
 * Komponent zabezpieczający route - wymaga autoryzacji
 * Użycie:
 * <ProtectedRoute redirectTo="/login">
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
	children, 
	redirectTo = Path.SIGN_IN,
	roles
}) => {
	const { isAuthenticated, loading, userI } = useAuthContext();

	if (loading) {
		return <Loading />;
	}

	if (!isAuthenticated || !Util.hasPermission(roles, userI)) {
		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
};
