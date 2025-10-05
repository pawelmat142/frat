import { LoginFormDto, RegisterFormDto } from "@shared/dto/AuthDto";
import { httpClient } from "global/services/http";
import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	User as FirebaseUser,
} from "firebase/auth";
import { toast } from "react-toastify";
import { FirebaseAuth } from "./FirebaseAuth";
import { UserI } from "@shared/interfaces/UserI";

export const AuthService = {

	/**
	 * Pobnranie stanu usera po zalogowaniu
	*/
	login(): Promise<UserI> {
		return httpClient.get("/auth/login");
	},

	/**
	 * Wylogowanie użytkownika
	 */
	logout(): Promise<void> {
		// TRIGGERS AUTH_HOOK
		return FirebaseAuth.getAuth().signOut()
	},

	/**
	 * Rejestracja przez backend - Firebase User zostanie utworzony tam
	 */
	registerForm(data: RegisterFormDto): Promise<any> {
		return httpClient.post("/auth/register-form", data);
	},

	/**
	 * Logowanie email/hasło przez Firebase Auth
	 */
	async loginForm(dto: LoginFormDto): Promise<void> {
		const auth = FirebaseAuth.getAuth();

		try {
			// Logowanie przez Firebase - token zostanie automatycznie wygenerowany
			await signInWithEmailAndPassword(
				auth,
				dto.email,
				dto.password
			);
			// TRIGGERS AUTH_HOOK

		} catch (error: any) {
			this.handleFireAuthError(error);
		}
	},

	/**
	 * Logowanie przez Google
	 */
	async loginWithGoogle(): Promise<void> {
		const auth = FirebaseAuth.getAuth();
		const provider = new GoogleAuthProvider();

		try {
			await signInWithPopup(auth, provider);
			// TRIGGERS AUTH_HOOK

		} catch (error: any) {
			this.handleFireAuthError(error);
		}
	},

	handleFireAuthError(error: any) {
		console.error('Login error:', error);
		const errorCode = error.code;

		// Obsługa błędów Firebase
		switch (errorCode) {
			case 'auth/invalid-credential':
			case 'auth/wrong-password':
			case 'auth/user-not-found':
				toast.error('Invalid email or password');
				throw new Error('Invalid email or password');
			case 'auth/too-many-requests':
				toast.error('Too many attempts. Try again later.');
				throw new Error('Too many attempts');
			case 'auth/user-disabled':
				toast.error('Account disabled');
				throw new Error('Account disabled');
			default:
				toast.error('Login failed. Please try again.');
				throw new Error('Login failed');
		}
	},

	/**
	 * Listener na zmiany stanu autoryzacji
	 * Użycie w komponencie/providzie do śledzenia stanu użytkownika
	 */
	onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
		const auth = FirebaseAuth.getAuth();
		return onAuthStateChanged(auth, callback);
	},

};
