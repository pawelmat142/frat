export const EmployeeProfileLocationOptions = {
    ALL_EUROPE: 'ALL_EUROPE',
    SELECTED_COUNTRIES_EUROPE: 'SELECTED_COUNTRIES_EUROPE',
    DISTANCE: 'DISTANCE',
} as const;

export type EmployeeProfileLocationOption = typeof EmployeeProfileLocationOptions[keyof typeof EmployeeProfileLocationOptions];