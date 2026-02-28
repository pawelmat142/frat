import { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from 'auth/services/AuthService';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';
import { useNavigate } from 'react-router-dom';
import { Path } from '../path';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

/**
 * Hook do zarządzania stanem autoryzacji
 * Śledzi aktualnie zalogowanego użytkownika Firebase
 */
export const useAuth = () => {
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState(true);
    const firstLoadRef = useRef(true);

    const navigate = useNavigate();
    const { t } = useTranslation()

	useEffect(() => {
		// Inicjalizuj Firebase przy pierwszym renderze
		if (!FirebaseAuth.isInitialized()) {
			FirebaseAuth.initialize();
		}

		// Subskrybuj zmiany stanu autoryzacji
		const unsubscribe = AuthService.onAuthStateChanged(async (newFirebaseUser) => {

            // AUTH_HOOK
            if (!newFirebaseUser) {
                setFirebaseUser(null)
            } else {
                setFirebaseUser(newFirebaseUser)
            }

            setLoading(false);
            
            if (firstLoadRef.current) {
                firstLoadRef.current = false;
                return;
            }

            if (newFirebaseUser) {
                navigate(Path.HOME, { replace: true });
                toast.success(t('signin.success'));
            } else {
                navigate(Path.HOME, { replace: true });
                toast.success(t('signin.signout'));
            }
		});

		return () => unsubscribe();
	}, []);

	return {
		firebaseUser,
		loading,
		isAuthenticated: !!firebaseUser,
	};
};
