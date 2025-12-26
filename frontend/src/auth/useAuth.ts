import { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from 'auth/services/AuthService';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';
import { UserI } from '@shared/interfaces/UserI';
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
	const [me, setMe] = useState<UserI | null>(null);
	const [loading, setLoading] = useState(true);
    const firstLoadRef = useRef(true);

    const navigate = useNavigate();
    const { t } = useTranslation()

	useEffect(() => {

        console.log('useAuth: Initializing Firebase Auth listener');
		// Inicjalizuj Firebase przy pierwszym renderze
		if (!FirebaseAuth.isInitialized()) {
			FirebaseAuth.initialize();
		}

		// Subskrybuj zmiany stanu autoryzacji
		const unsubscribe = AuthService.onAuthStateChanged(async (newFirebaseUser) => {
            console.log('useAuth: Auth state changed', newFirebaseUser);
            console.log('prev firebaseUser: ', firebaseUser)

            // AUTH_HOOK
            
            if (!newFirebaseUser) {
                setFirebaseUser(null)
                setMe(null)
            }
            else if (newFirebaseUser?.uid && !me) {
                setLoading(true);
                const newUser = await AuthService.login()
                if (newUser) {
                    setMe(newUser)
                    AuthService.saveTelegramLogin(newUser);
                    setFirebaseUser(newFirebaseUser)
                } else {
                    setMe(null)
                    setFirebaseUser(null)
                }
            } 
            else {
                setFirebaseUser(newFirebaseUser)
            }
            
			setLoading(false);

            if (firstLoadRef.current) {
                console.log('First load - skipping setting state to avoid flicker');
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

    const updateMe = (user: UserI): void => {
        console.log('useAuth: Updating me user:', user);
        setMe(user);
    }

	return {
		firebaseUser,
		loading,
        me,
		isAuthenticated: !!firebaseUser && !!me,
        updateMe
	};
};
