import { DateRangeI, EmployeeProfileAvailabilityOptions, EmployeeProfileI, EmployeeProfileLocationOptions, EmployeeProfileStatuses } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { AdminUtil } from "admin/AdminUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { DeepPartial } from "typeorm";

const pickFromCycle = <T>(items: T[], index: number): T => items[index % items.length];

const firstNamePool = [
    "Liam",
    "Emma",
    "Noah",
    "Olivia",
    "Ava",
    "Mia",
    "Lucas",
    "Ethan",
    "Sofia",
    "Amelia",
    "Mateo",
    "Leo",
    "Hanna",
    "Nora",
    "Ida",
    "Max",
    "Anton",
    "Lukas",
    "Elise",
    "Sara",
    "Tomas",
    "Marek",
    "Erik",
    "Jonas",
    "Isla",
];

const lastNamePool = [
    "Kowalski",
    "Novak",
    "Svensson",
    "Niemi",
    "Garcia",
    "Fernandez",
    "Hansen",
    "Johansen",
    "Leclerc",
    "Dubois",
    "Muller",
    "Schmidt",
    "Berg",
    "Petrov",
    "Nowak",
    "Horvat",
    "Dimitrov",
    "Stoica",
    "Bianchi",
    "Rossi",
    "Santos",
    "Silva",
    "Larsen",
    "Nielsen",
    "Olsen",
];

const languagePool: string[][] = [
    ["en", "pl"],
    ["en", "de"],
    ["en", "fr"],
    ["en", "es"],
    ["en", "no"],
    ["en", "pt"],
    ["en", "da"],
    ["en", "sv"],
    ["pl", "en"],
    ["de", "en"],
    ["fr", "en"],
    ["es", "en"],
    ["da", "en"],
    ["no", "en"],
    ["cs", "en"],
    ["sk", "en"],
    ["it", "en"],
    ["nl", "en"],
    ["en"],
];

const skillPool: string[][] = [
    ["ONE", "TWO"],
    ["THREE", "FOUR"],
    ["FIVE", "SIX"],
    ["SIX", "SEVEN"],
    ["TWO", "FOUR"],
    ["TWO", "SIX"],
    ["FIVE", "SEVEN"],
    ["THREE", "FIVE"],
    ["ONE", "FOUR"],
    ["ONE", "SIX"],
    ["TWO", "THREE"],
    ["FOUR", "FIVE"],
];

const certificatePool: string[][] = [
    ["ONE"],
    ["TWO"],
    ["THREE"],
    ["FOUR"],
    ["FIVE"],
    ["SIX"],
    ["SEVEN"],
    ["ONE", "TWO"],
    ["THREE", "FOUR"],
    ["FIVE", "SIX"],
    ["FOUR", "SEVEN"],
];

const locationEntries = [
    { label: "Gdansk", country: "pl", coordinates: [18.649, 54.352], radius: 250, selectedCountries: ["pl", "de"] },
    { label: "Berlin", country: "de", coordinates: [13.405, 52.52], radius: 300, selectedCountries: ["de", "nl"] },
    { label: "Oslo", country: "no", coordinates: [10.752, 59.913], radius: 350, selectedCountries: ["no", "se"] },
    { label: "Lisbon", country: "pt", coordinates: [-9.139, 38.722], radius: 400, selectedCountries: ["pt", "es"] },
    { label: "Barcelona", country: "es", coordinates: [2.173, 41.385], radius: 320, selectedCountries: ["es", "fr"] },
    { label: "Bergen", country: "no", coordinates: [5.323, 60.392], radius: 280, selectedCountries: ["no", "dk"] },
    { label: "Copenhagen", country: "dk", coordinates: [12.568, 55.676], radius: 260, selectedCountries: ["dk", "se"] },
    { label: "Tallinn", country: "ee", coordinates: [24.753, 59.437], radius: 420, selectedCountries: ["ee", "fi"] },
    { label: "Vilnius", country: "lt", coordinates: [25.279, 54.687], radius: 380, selectedCountries: ["lt", "lv"] },
    { label: "Rotterdam", country: "nl", coordinates: [4.479, 51.922], radius: 340, selectedCountries: ["nl", "be"] },
];

const locationOptionsCycle = [
    EmployeeProfileLocationOptions.ALL_EUROPE,
    EmployeeProfileLocationOptions.DISTANCE,
    EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE,
];

// Algorytm: rozrzucenie dat po pierwszych 7 dniach kolejnych 24 miesięcy od dziś
function getRandomizedCreatedAt(idx: number): Date {
    return AdminUtil.getRandomizedCreatedAt(idx)
}

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
            // residenceCountry: 'de',
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
            // residenceCountry: 'pl',
            communicationLanguages: ['pl', 'en'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [21.0122, 52.2297] }, // Warsaw
            pointRadius: 500,
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
            // residenceCountry: 'fr',
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
            // residenceCountry: 'it',
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
            // residenceCountry: 'pl',
            communicationLanguages: ['pl', 'de'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [19.945, 50.0647] }, // Krakow
            pointRadius: 300,
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
            // residenceCountry: 'de',
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
            // residenceCountry: 'es',
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
            // residenceCountry: 'cz',
            communicationLanguages: ['cs', 'en'],
            locationOption: EmployeeProfileLocationOptions.DISTANCE,
            point: { type: 'Point', coordinates: [14.4378, 50.0755] }, // Prague
            pointRadius: 1000,
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
            // residenceCountry: 'pl', 
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

    const baseIndex = result.length;

    const createGeneratedProfile = (index: number): DeepPartial<EmployeeProfileEntity> => {
        const globalIndex = baseIndex + index;
        const location = pickFromCycle(locationEntries, index);
        const firstName = pickFromCycle(firstNamePool, index);
        const lastName = pickFromCycle(lastNamePool, index + 3);
        const languages = pickFromCycle(languagePool, index + 5);
        const skills = pickFromCycle(skillPool, index + 7);
        const certificates = pickFromCycle(certificatePool, index + 9);
        const locationOption = pickFromCycle(locationOptionsCycle, index);
        const availabilityOption = index % 2 === 0
            ? EmployeeProfileAvailabilityOptions.DATE_RANGES
            : EmployeeProfileAvailabilityOptions.ANYTIME;
        const status = index % 12 === 0 ? EmployeeProfileStatuses.INACTIVE : EmployeeProfileStatuses.ACTIVE;
        const createdAt = getRandomizedCreatedAt(globalIndex);

        const displayName = `${firstName} ${lastName}`;
        const email = `${firstName}.${lastName}${globalIndex}@example.com`.toLowerCase();
        const uid = `seed-employee-${globalIndex.toString().padStart(3, "0")}`;

        const profile: DeepPartial<EmployeeProfileEntity> = {
            uid,
            displayName,
            email,
            firstName,
            lastName,
            communicationLanguages: languages,
            locationOption,
            status,
            employeeProfileId: globalIndex,
            createdAt,
            skills,
            certificates,
            availabilityOption,
            availabilityDateRanges: availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES ? [] : undefined,
            jobs: [],
            views: [],
        };

        if (locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            profile.point = { type: 'Point', coordinates: location.coordinates as [number, number] };
            profile.pointRadius = location.radius;
            profile.address = `${location.label}, ${location.country.toUpperCase()}`;
        }

        if (locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE) {
            profile.locationCountries = location.selectedCountries;
        }

        return profile;
    };

    const generatedProfiles = Array.from({ length: 50 }, (_, index) => createGeneratedProfile(index));
    result.push(...generatedProfiles);

    return result.map((profile, idx) => {
        fillAvailabilityRanges(profile);
        return profile;
    });
}
