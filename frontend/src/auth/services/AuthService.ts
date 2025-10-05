import { LoginFormDto, LoginFormResponse, RegisterFormDto } from "@shared/dto/AuthDto";
import { httpClient } from "global/services/http";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from "firebase/auth";
import { toast } from "react-toastify";

let firebaseInitialized = false;
let authInstance: ReturnType<typeof getAuth> | null = null;


function getFirebaseConfig(): FirebaseConfig | null {
	const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
	const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
	const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
	const appId = process.env.REACT_APP_FIREBASE_APP_ID;
	if (!apiKey || !authDomain || !projectId || !appId) {
		toast.error("Firebase configuration is incomplete. Please set the environment variables.");
		return null;
	}
	return {
		apiKey,
		authDomain,
		projectId,
		appId,
	};
}

async function ensureFirebaseInitialized(): Promise<ReturnType<typeof getAuth>> {
	if (!firebaseInitialized) {
		const config = getFirebaseConfig();
		if (config) {
			if (getApps().length === 0) {
				initializeApp(config);
			}
			authInstance = getAuth();
			firebaseInitialized = true;
		}
	}
	return authInstance!;
}

export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	appId: string;
}

export const AuthService = {
	async registerForm(data: RegisterFormDto): Promise<any> {
		return httpClient.post("/auth/register-form", data);
	},

	async loginForm(dto: LoginFormDto): Promise<LoginFormResponse> {
		return httpClient.post("/auth/login-form", dto);
	},

	async loginWithGoogle() {

		// TODO obsluzyc do konca, loading, bledy itd
		const auth = await ensureFirebaseInitialized();
		console.log('Firebase Auth:', auth);

		const provider = new GoogleAuthProvider();
		console.log('Google Auth Provider:', provider);

		const userCredential: UserCredential = await signInWithPopup(auth, provider);
		console.log('Sign-in result:', userCredential);

		const idToken = await userCredential.user.getIdToken();
		console.log('ID Token:', idToken);

		const response = await httpClient.post("/auth/login-google", { idToken });
		console.log('Backend response:', response);
	}
};
