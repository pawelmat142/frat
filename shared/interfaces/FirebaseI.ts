export interface FirebaseUserCredential {
  user: FirebaseUser;
  providerId: string;
  _tokenResponse: FirebaseTokenResponse;
  operationType: string;
}

export interface FirebaseUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  providerId: string;
  accessToken: string;
  // inne pola z Firebase User
  [key: string]: any;
}

export interface FirebaseTokenResponse {
  federatedId: string;
  providerId: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  photoUrl?: string;
  // inne pola z tokena
  [key: string]: any;
}
