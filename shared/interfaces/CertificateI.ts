export interface CertificateI {

    certificateId: number;
    uid: string;
    code: string;
    validityDate: string; // Local date string in YYYY-MM-DD format
}


// this const represents WORK_CATEGORY dictionary values, which are used in the application.
// Values of this collections are used as groups of CERTIFICATES dictionary, so they are important for correct functioning of certificates selector in offer search filters.

export const WORK_CATEGORIES = {
    ONSHORE: 'ONSHORE',
    OFFSHORE: 'OFFSHORE',
    WIND: 'WIND',
} as const;

export type Category = typeof WORK_CATEGORIES[keyof typeof WORK_CATEGORIES];