import { GeocodedPosition } from './MapsInterfaces';
import { AvatarRef } from './UserI';
import { ParsedPhoneNumber, Point } from './WorkerI';

// ─── Training Provider Profile ────────────────────────────────────────────────

export interface TrainingProviderProfileI {
    providerId: number;
    uid: string;
    companyName: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    phoneNumber?: ParsedPhoneNumber;
    logoRef?: AvatarRef;
    locationCountry: string;
    displayAddress?: string;
    point?: Point;
    status: TrainingProviderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export const TrainingProviderStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;
export type TrainingProviderStatus = typeof TrainingProviderStatuses[keyof typeof TrainingProviderStatuses];

// ─── Training ─────────────────────────────────────────────────────────────────

export interface TrainingI {
    trainingId: number;
    /** FK to TrainingProviderProfile */
    providerId: number;
    /** uid of the owning user – used for ownership checks */
    uid: string;
    title: string;
    description?: string;
    /** Code from CERTIFICATES dictionary */
    certificateCode: string;
    /** Language codes from LANGUAGES dictionary */
    languages?: string[];
    locationCountry: string;
    displayAddress?: string;
    point?: Point;
    price?: number;
    currency?: string;
    isRecurring: boolean;
    /** Approximate interval in days between editions, e.g. 90 = every ~3 months */
    recurringIntervalDays?: number;
    maxParticipants?: number;
    contactEmail?: string;
    contactWebsite?: string;
    status: TrainingStatus;
    uniqueViewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const TrainingStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    DRAFT: 'DRAFT',
} as const;
export type TrainingStatus = typeof TrainingStatuses[keyof typeof TrainingStatuses];

// ─── Training Session ─────────────────────────────────────────────────────────

export interface TrainingSessionI {
    sessionId: number;
    trainingId: number;
    /** Local date string in YYYY-MM-DD format */
    startDate: string;
    /** Local date string in YYYY-MM-DD format */
    endDate?: string;
    /** Override training location for a specific session */
    locationCountry?: string;
    displayAddress?: string;
    point?: Point;
    maxParticipants?: number;
    /** Placeholder for future booking feature */
    bookingsCount: number;
    status: TrainingSessionStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const TrainingSessionStatuses = {
    SCHEDULED: 'SCHEDULED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
} as const;
export type TrainingSessionStatus = typeof TrainingSessionStatuses[keyof typeof TrainingSessionStatuses];

// ─── Search ───────────────────────────────────────────────────────────────────

export interface TrainingSearchFilters {
    certificateCode?: string;
    locationCountry?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    languages?: string[];
    skip: number;
    limit: number;
}

export interface TrainingSearchResponse {
    trainings: TrainingWithNextSession[];
    count: number;
}

export interface TrainingWithNextSession extends TrainingI {
    nextSession?: TrainingSessionI;
}

export interface ProviderFormData {
    companyName: string;
    description: string;
    website?: string;
    contactEmail: string;
    phoneNumber: ParsedPhoneNumber;
    locationCountry: string;
    geocodedPosition?: GeocodedPosition | null;
}