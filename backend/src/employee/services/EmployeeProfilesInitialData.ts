import { DateRangeI, EmployeeProfileAvailabilityOptions, EmployeeProfileFormRangesOptions, EmployeeProfileI, EmployeeProfileLocationOptions, EmployeeProfileStatuses } from "@shared/interfaces/EmployeeProfileI";
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
    { label: "Madrid", country: "es", coordinates: [-3.7038, 40.4168], radius: 400, selectedCountries: ["es", "pt"] },
    { label: "Rome", country: "it", coordinates: [12.4964, 41.9028], radius: 380, selectedCountries: ["it"] },
    { label: "Milan", country: "it", coordinates: [9.19, 45.4642], radius: 300, selectedCountries: ["it", "ch"] },
    { label: "Athens", country: "gr", coordinates: [23.7275, 37.9838], radius: 420, selectedCountries: ["gr"] },
    { label: "Dublin", country: "ie", coordinates: [-6.2603, 53.3498], radius: 360, selectedCountries: ["ie", "gb"] },
    { label: "Edinburgh", country: "gb", coordinates: [-3.1883, 55.9533], radius: 300, selectedCountries: ["gb"] },
    { label: "Manchester", country: "gb", coordinates: [-2.2426, 53.4808], radius: 300, selectedCountries: ["gb"] },
    { label: "Zurich", country: "ch", coordinates: [8.5417, 47.3769], radius: 260, selectedCountries: ["ch", "de"] },
    { label: "Geneva", country: "ch", coordinates: [6.1432, 46.2044], radius: 280, selectedCountries: ["ch", "fr"] },
    { label: "Budapest", country: "hu", coordinates: [19.0402, 47.4979], radius: 340, selectedCountries: ["hu", "sk"] },
    { label: "Bratislava", country: "sk", coordinates: [17.1077, 48.1486], radius: 300, selectedCountries: ["sk", "hu"] },
    { label: "Zagreb", country: "hr", coordinates: [15.9819, 45.8150], radius: 320, selectedCountries: ["hr", "si"] },
    { label: "Ljubljana", country: "si", coordinates: [14.5058, 46.0569], radius: 260, selectedCountries: ["si", "hr"] },
    { label: "Sofia", country: "bg", coordinates: [23.3219, 42.6977], radius: 380, selectedCountries: ["bg", "ro"] },
    { label: "Bucharest", country: "ro", coordinates: [26.1025, 44.4268], radius: 400, selectedCountries: ["ro", "bg"] },
    { label: "Belgrade", country: "rs", coordinates: [20.4573, 44.7872], radius: 360, selectedCountries: ["rs", "bg"] },
    { label: "Reykjavik", country: "is", coordinates: [-21.8277, 64.1466], radius: 600, selectedCountries: ["is"] },
    { label: "Helsinki", country: "fi", coordinates: [24.9384, 60.1699], radius: 420, selectedCountries: ["fi", "se"] },
    { label: "Stockholm", country: "se", coordinates: [18.0686, 59.3293], radius: 400, selectedCountries: ["se", "fi"] },
    { label: "Malmö", country: "se", coordinates: [13.0038, 55.6050], radius: 260, selectedCountries: ["se", "dk"] },
    { label: "Antwerp", country: "be", coordinates: [4.4025, 51.2194], radius: 280, selectedCountries: ["be", "nl"] },
    { label: "Brussels", country: "be", coordinates: [4.3517, 50.8503], radius: 320, selectedCountries: ["be", "fr"] },
    { label: "Luxembourg", country: "lu", coordinates: [6.1319, 49.6116], radius: 300, selectedCountries: ["lu", "be"] },
];

const locationOptionsCycle = [
    EmployeeProfileLocationOptions.ALL_EUROPE,
    EmployeeProfileLocationOptions.POSITION,
    EmployeeProfileLocationOptions.SELECTED_COUNTRIES,
];

// Algorytm: rozrzucenie dat po pierwszych 7 dniach kolejnych 24 miesięcy od dziś
function getRandomizedCreatedAt(idx: number): Date {
    return AdminUtil.getRandomizedCreatedAt(idx)
}

const rangesJ: DateRangeI[] = []

// Helper: generate a random street name, postcode and fullAddress for a given location
const streetNames = [
    'Main St', 'Oak St', 'Pine St', 'Maple Ave', 'High Street', 'Station Road', 'King St', 'Queen St',
    'Church St', 'Church Lane', 'Market St', 'Broadway', 'Elm Street', 'River Road', 'Garden Lane'
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePostcode = (country: string) => {
    // Very simple postcode generator per country heuristic
    switch (country) {
        case 'gb': // UK: AA9 9AA style simplified
            return `${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(1, 9)} ${randomInt(1,9)}${String.fromCharCode(65 + randomInt(0,25))}${String.fromCharCode(65 + randomInt(0,25))}`;
        case 'pl':
            return `${randomInt(10,99)}-${randomInt(100,999)}`;
        case 'de':
            return `${randomInt(1,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}`;
        case 'fr':
            return `${randomInt(1,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}`;
        case 'es':
            return `${randomInt(1,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}`;
        case 'it':
            return `${randomInt(1,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}${randomInt(0,9)}`;
        default:
            return `${randomInt(10000, 99999)}`;
    }
}

const generateRandomAddress = (location: { label: string; country: string }) => {
    const street = `${randomInt(1, 200)} ${pickFromCycle(streetNames, randomInt(0, streetNames.length - 1))}`;
    const postcode = generatePostcode(location.country);
    const fullAddress = `${street}, ${location.label}, ${location.country.toUpperCase()} ${postcode}`;
    return { street, postcode, fullAddress };
}

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

    const result = []

    const baseIndex = result.length;

    const createGeneratedProfile = (index: number): DeepPartial<EmployeeProfileEntity> => {
        const globalIndex = baseIndex + index;
        const location = pickFromCycle(locationEntries, index);
        const firstName = pickFromCycle(firstNamePool, index);
        const lastName = pickFromCycle(lastNamePool, index + 3);
        const languages = pickFromCycle(languagePool, index + 5);
        const experience = pickFromCycle(skillPool, index + 7);
        const certificates = pickFromCycle(certificatePool, index + 9);
        const locationOption = pickFromCycle(locationOptionsCycle, index);
        const availabilityOptions = [
            EmployeeProfileAvailabilityOptions.DATE_RANGES,
            EmployeeProfileAvailabilityOptions.ANYTIME,
            EmployeeProfileAvailabilityOptions.FROM_DATE,
        ];
        const availabilityOption = pickFromCycle(availabilityOptions, index);
        const rangesOption = index % 2 === 0
            ? EmployeeProfileFormRangesOptions.AVAILABLE_ON
            : EmployeeProfileFormRangesOptions.NOT_AVAILABLE_ON;
        const status = index % 12 === 0 ? EmployeeProfileStatuses.INACTIVE : EmployeeProfileStatuses.ACTIVE;
        const createdAt = getRandomizedCreatedAt(globalIndex);

        const displayName = `${firstName} ${lastName}`;
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName}.${lastName}${globalIndex}@example.com`.toLowerCase();
        const uid = `seed-employee-${globalIndex.toString().padStart(3, "0")}`;

        const adress = generateRandomAddress(location)

        const phonePrefixes = ['+48', '+49', '+44', '+33', '+34', '+39', '+31', '+420', '+421'];
        const phoneNumber = {
            prefix: phonePrefixes[randomInt(0, phonePrefixes.length - 1)],
            phoneNumber: `${randomInt(100, 999)}${randomInt(100, 999)}${randomInt(100, 999)}`
        };
        
        // Generate startDate for FROM_DATE option
        const startDate = new Date(createdAt);
        startDate.setMonth(startDate.getMonth() + randomInt(1, 6));

        const profile: DeepPartial<EmployeeProfileEntity> = {
            uid,
            displayName,
            fullName,
            email,
            phoneNumber,
            communicationLanguages: languages,
            locationOption,
            status,
            employeeProfileId: globalIndex,
            createdAt,
            experience,
            certificates,
            availabilityOption,
            availabilityDateRanges: availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES ? [] : undefined,
            rangesOption: availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES ? rangesOption : undefined,
            startDate: availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE ? startDate : null,
            jobs: numberToStringList(getRandomNumberFromTo(0, 20, globalIndex)).map(n => `job-${n}`),
            views: numberToStringList(getRandomNumberFromTo(30, 100, globalIndex)).map(n => `view-${n}`),
            fullAddress: adress.fullAddress,
        };

        if (locationOption === EmployeeProfileLocationOptions.POSITION) {
            profile.point = { type: 'Point', coordinates: randomizeCoordinates((location.coordinates) as [number, number], 0.1) };
            profile.geocodedPosition = {
                lat: location.coordinates[1],
                lng: location.coordinates[0],
                countryCode: location.country,
            };
            profile.fullAddress = `${adress.street}, ${location.label}, ${location.country.toUpperCase()} ${adress.postcode}`;
        }

        if (locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES) {
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

const numberToStringList = (number: number): string[] => {
    let result: string[] = [];
    for (let i = 0; i < number; i++) {
        result.push((i + 1).toString());
    }
    return result;
}

const getRandomNumberFromTo = (from: number, to: number, idx: number): number => {
    const random = (Math.sin(idx + 1) + 1) / 2; // value between 0 and 1
    return Math.floor(from + random * (to - from + 1));
}

const randomizeCoordinates = (base: [number, number], maxOffset: number): [number, number] => {
    const offsetLat = (Math.random() - 0.5) * 2 * maxOffset;
    const offsetLng = (Math.random() - 0.5) * 2 * maxOffset;
    return [base[0] + offsetLng, base[1] + offsetLat];
}