import { DateRangeI, EmployeeProfileAvailabilityOptions, EmployeeProfileI, EmployeeProfileLocationOptions, EmployeeProfileStatuses } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { DeepPartial } from "typeorm";

// Algorytm: rozrzucenie dat po pierwszych 7 dniach kolejnych 24 miesięcy od dziś
function getRandomizedCreatedAt(idx: number): Date {
    const now = new Date();
    const baseMonth = now.getMonth();
    const baseYear = now.getFullYear();
    // Rozłóż po 24 miesiącach, po kolei, z losowym dniem 1-7
    const monthOffset = idx % 24;
    const year = baseYear + Math.floor((baseMonth + monthOffset) / 12);
    const month = (baseMonth + monthOffset) % 12;
    const day = 1 + Math.floor(Math.random() * 7); // 1-7
    return new Date(year, month, day, 8, 0, 0, 0); // 8:00 rano
}

// TODO sprawdzic uzupelnianie sie pol od distance i selected country
const rangesJ: DateRangeI[] = []

const fillAvailabilityRanges = (profile: DeepPartial<EmployeeProfileI>) => {
    if (profile.availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES && profile.createdAt) {
        const n = Math.floor(Math.random() * 4) + 1; // 1-4 przedziały
        const ranges: { start: Date; end: Date }[] = [];

        let currentStartOffset = 0;

        for (let i = 0; i < n; i++) {
            // m: miesięcy opóźnienia od poprzedniego końca (lub od createdAt dla pierwszego)
            const m = Math.floor(Math.random() * 15) + 1; // 1-15 miesięcy
            // l: długość przedziału w miesiącach
            const l = Math.floor(Math.random() * 18) + 3; // 3-20 miesięcy

            // Dodaj opóźnienie do poprzedniego końca (lub do createdAt)
            currentStartOffset += m;

            const startDate = new Date(profile.createdAt as Date);
            startDate.setMonth(startDate.getMonth() + currentStartOffset);

            const endDate = new Date(startDate.getTime());
            endDate.setMonth(endDate.getMonth() + l);

            ranges.push({ start: startDate, end: endDate });

            // Przesunięcie dla następnego przedziału: dodaj długość obecnego + min 1 miesiąc przerwy
            currentStartOffset += l + 1;
        }

        const rangesI: DateRangeI[] = []
        for (let r of ranges) {
            const dr = DateRangeUtil.fromDateRange(rangesJ, r);
            rangesI.push(dr);
            rangesJ.push(dr);
        }
        profile.availabilityDateRanges = rangesI;
    }
}

export const EmployeeProfilesInitialData = (): DeepPartial<EmployeeProfileEntity>[] => {
    const result: DeepPartial<EmployeeProfileEntity>[] = [
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'John Doe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            residenceCountry: 'de',
            communicationLanguages: ['en', 'de'],
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 0,
            createdAt: getRandomizedCreatedAt(0),
            skills: ['ONE', 'TWO'],
            certificates: ['THREE', 'FOUR'],
            availabilityOption: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Anna Schmidt',
            email: 'anna.schmidt@example.com',
            firstName: 'Anna',
            lastName: 'Schmidt',
            residenceCountry: 'pl',
            communicationLanguages: ['pl', 'en'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [21.0122, 52.2297] }, // Warsaw
            pointRadius: 150,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 1,
            createdAt: getRandomizedCreatedAt(1),
            skills: ['THREE', 'FOUR'],
            certificates: ['ONE', 'TWO'],
            availabilityOption: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Pierre Martin',
            email: 'pierre.martin@example.com',
            firstName: 'Pierre',
            lastName: 'Martin',
            residenceCountry: 'fr',
            communicationLanguages: ['fr', 'en'],
            locationOption: EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 2,
            createdAt: getRandomizedCreatedAt(2),
            skills: ['FIVE', 'SIX'],
            certificates: ['FIVE', 'SIX'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Maria Rossi',
            email: 'maria.rossi@example.com',
            firstName: 'Maria',
            lastName: 'Rossi',
            residenceCountry: 'it',
            communicationLanguages: ['it', 'en'],
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 3,
            createdAt: getRandomizedCreatedAt(3),
            skills: ['SEVEN', 'ONE'],
            certificates: ['SEVEN', 'ONE'],
            availabilityOption: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Sofia Nowak',
            email: 'sofia.nowak@example.com',
            firstName: 'Sofia',
            lastName: 'Nowak',
            residenceCountry: 'pl',
            communicationLanguages: ['pl', 'de'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [19.945, 50.0647] }, // Krakow
            pointRadius: 100,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 4,
            createdAt: getRandomizedCreatedAt(4),
            skills: ['TWO', 'THREE'],
            certificates: ['TWO', 'THREE'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Lucas Müller',
            email: 'lucas.mueller@example.com',
            firstName: 'Lucas',
            lastName: 'Müller',
            residenceCountry: 'de',
            communicationLanguages: ['de', 'en'],
            locationOption: EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 5,
            createdAt: getRandomizedCreatedAt(5),
            skills: ['FOUR', 'FIVE'],
            certificates: ['FOUR', 'FIVE'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Elena García',
            email: 'elena.garcia@example.com',
            firstName: 'Elena',
            lastName: 'García',
            residenceCountry: 'es',
            communicationLanguages: ['es', 'en'],
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 6,
            createdAt: getRandomizedCreatedAt(6),
            skills: ['SIX', 'SEVEN'],
            certificates: ['SIX', 'SEVEN'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Marek Novak',
            email: 'marek.novak@example.com',
            firstName: 'Marek',
            lastName: 'Novak',
            residenceCountry: 'cz',
            communicationLanguages: ['cs', 'en'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [14.4378, 50.0755] }, // Prague
            pointRadius: 120,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 7,
            createdAt: getRandomizedCreatedAt(7),
            skills: ['ONE', 'FIVE'],
            certificates: ['ONE', 'FIVE'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            uid: 'Mx9ELkLpgTWri2ntBiMCWJw7bsM2',
            displayName: 'Katarzyna Zielinska',
            email: 'katarzyna.zielinska@example.com',
            firstName: 'Katarzyna',
            lastName: 'Zielinska',
            residenceCountry: 'pl',
            communicationLanguages: ['pl', 'en'],
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
            status: EmployeeProfileStatuses.ACTIVE,
            employeeProfileId: 8,
            createdAt: getRandomizedCreatedAt(8),
            skills: ['THREE', 'SEVEN'],
            certificates: ['THREE', 'SEVEN'],
            availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
    ]

    return result.map((profile, idx) => {
        fillAvailabilityRanges(profile);
        return profile;
    });
}
