import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	appId: string;
}

/**
 * Singleton do zarządzania instancją Firebase
 * Inicjalizowany raz przy starcie aplikacji
 */
class FirebaseAuthManager {
	private static instance: FirebaseAuthManager;
	private app: FirebaseApp | null = null;
	private auth: Auth | null = null;
	private initialized: boolean = false;

	private constructor() {}

	public static getInstance(): FirebaseAuthManager {
		if (!FirebaseAuthManager.instance) {
			FirebaseAuthManager.instance = new FirebaseAuthManager();
		}
		return FirebaseAuthManager.instance;
	}

	/**
	 * Inicjalizuje Firebase - powinno być wywołane przy starcie aplikacji
	 */
	public initialize(): void {
		if (this.initialized) {
			console.warn('Firebase already initialized');
			return;
		}

		const config = this.getConfig();
		if (!config) {
			console.error('Firebase configuration is missing');
			return;
		}

		try {
			// Sprawdź czy Firebase nie jest już zainicjalizowany
			if (getApps().length === 0) {
				this.app = initializeApp(config);
			} else {
				this.app = getApps()[0];
			}

			this.auth = getAuth(this.app);
			this.initialized = true;
		} catch (error) {
			console.error('Firebase initialization error:', error);
		}
	}

	/**
	 * Pobiera instancję Auth
	 * Rzuca błąd jeśli Firebase nie został zainicjalizowany
	 */
	public getAuth(): Auth {
		if (!this.auth) {
			throw new Error('Firebase not initialized. Call FirebaseAuth.initialize() first.');
		}
		return this.auth;
	}

	/**
	 * Sprawdza czy Firebase jest zainicjalizowany
	 */
	public isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Pobiera aktualny token ID użytkownika
	 */
	public async getCurrentIdToken(): Promise<string | null> {
		if (!this.auth) {
			return null;
		}

		const user = this.auth.currentUser;
		if (!user) {
			return null;
		}

		try {
			return await user.getIdToken();
		} catch (error) {
			console.error('Error getting ID token:', error);
			return null;
		}
	}

	private getConfig(): FirebaseConfig | null {
		const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
		const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
		const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
		const appId = process.env.REACT_APP_FIREBASE_APP_ID;

		if (!apiKey || !authDomain || !projectId || !appId) {
			console.error('Firebase configuration is incomplete. Check environment variables.');
			return null;
		}

		return {
			apiKey,
			authDomain,
			projectId,
			appId,
		};
	}
}

// Eksportuj singleton
export const FirebaseAuth = FirebaseAuthManager.getInstance();
