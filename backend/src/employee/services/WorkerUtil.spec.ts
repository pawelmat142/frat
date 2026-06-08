import { WorkerAvailabilityOptions, WorkerLocationOptions, WorkerStatuses } from "@shared/interfaces/WorkerI";
import { WorkerEntity } from "employee/model/WorkerEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial } from "typeorm";
import { WorkerUtils } from "./WorkerUtil";

function validProfile(): DeepPartial<WorkerEntity> {
    return {
        uid: 'test-uid',
        status: WorkerStatuses.ACTIVE,
        fullName: 'Jan Kowalski',
        phoneNumber: { prefix: '+48', number: '123456789' },
        email: 'jan@example.com',
        communicationLanguages: ['pl'],
        avatarRef: { publicId: 'avatar-1', url: 'https://example.com/avatar.jpg' },
        locationOption: WorkerLocationOptions.ALL_EUROPE,
        locationCountries: [],
        availabilityOption: WorkerAvailabilityOptions.ANYTIME,
    };
}

describe('WorkerUtil', () => {

    describe('validateProfile', () => {

        it('should pass for a valid complete profile', () => {
            expect(() => WorkerUtils.validateProfile(validProfile())).not.toThrow();
        });

        it('should throw when profile is null', () => {
            expect(() => WorkerUtils.validateProfile(null)).toThrow(ToastException);
        });

        it('should throw when uid is missing', () => {
            const profile = validProfile();
            delete profile.uid;
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when status is missing', () => {
            const profile = validProfile();
            delete profile.status;
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when fullName is missing', () => {
            const profile = validProfile();
            profile.fullName = '';
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when phoneNumber is missing', () => {
            const profile = validProfile();
            delete profile.phoneNumber;
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when phoneNumber.number is empty', () => {
            const profile = validProfile();
            profile.phoneNumber = { prefix: '+48', number: '' };
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when email is missing', () => {
            const profile = validProfile();
            profile.email = '';
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when communicationLanguages is empty', () => {
            const profile = validProfile();
            profile.communicationLanguages = [];
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        it('should throw when avatarRef is missing', () => {
            const profile = validProfile();
            delete profile.avatarRef;
            expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
        });

        describe('availability validation', () => {

            it('should throw when FROM_DATE has no startDate', () => {
                const profile = validProfile();
                profile.availabilityOption = WorkerAvailabilityOptions.FROM_DATE;
                profile.startDate = null;
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });

            it('should pass when FROM_DATE has a startDate', () => {
                const profile = validProfile();
                profile.availabilityOption = WorkerAvailabilityOptions.FROM_DATE;
                profile.startDate = '2026-05-01';
                expect(() => WorkerUtils.validateProfile(profile)).not.toThrow();
            });

            it('should throw when DATE_RANGES has no ranges', () => {
                const profile = validProfile();
                profile.availabilityOption = WorkerAvailabilityOptions.DATE_RANGES;
                profile.availabilityDateRanges = [];
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });

            it('should pass when DATE_RANGES has valid ranges', () => {
                const profile = validProfile();
                profile.availabilityOption = WorkerAvailabilityOptions.DATE_RANGES;
                profile.availabilityDateRanges = [
                    { id: 1, dateRange: '[2026-05-01,2026-05-31]' } as any,
                ];
                expect(() => WorkerUtils.validateProfile(profile)).not.toThrow();
            });
        });

        describe('location validation', () => {

            it('should throw when locationOption is missing', () => {
                const profile = validProfile();
                delete profile.locationOption;
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });

            it('should throw when SELECTED_COUNTRIES has no countries', () => {
                const profile = validProfile();
                profile.locationOption = WorkerLocationOptions.SELECTED_COUNTRIES;
                profile.locationCountries = [];
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });

            it('should pass when SELECTED_COUNTRIES has countries', () => {
                const profile = validProfile();
                profile.locationOption = WorkerLocationOptions.SELECTED_COUNTRIES;
                profile.locationCountries = ['PL', 'DE'];
                expect(() => WorkerUtils.validateProfile(profile)).not.toThrow();
            });

            it('should throw when POSITION has no point', () => {
                const profile = validProfile();
                profile.locationOption = WorkerLocationOptions.POSITION;
                profile.locationCountries = ['PL'];
                delete profile.point;
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });

            it('should pass when POSITION has point', () => {
                const profile = validProfile();
                profile.locationOption = WorkerLocationOptions.POSITION;
                profile.locationCountries = ['PL'];
                profile.point = { type: 'Point', coordinates: [21.0, 52.0] } as any;
                expect(() => WorkerUtils.validateProfile(profile)).not.toThrow();
            });

            it('should throw when ALL_EUROPE has countries specified', () => {
                const profile = validProfile();
                profile.locationOption = WorkerLocationOptions.ALL_EUROPE;
                profile.locationCountries = ['PL'];
                expect(() => WorkerUtils.validateProfile(profile)).toThrow(ToastException);
            });
        });
    });

    describe('fillLocationData', () => {

        it('should set locationCountries to empty array for ALL_EUROPE', () => {
            const profile: DeepPartial<WorkerEntity> = {};
            WorkerUtils.fillLocationData(profile, {
                locationOption: WorkerLocationOptions.ALL_EUROPE,
            } as any);
            expect(profile.locationOption).toBe(WorkerLocationOptions.ALL_EUROPE);
            expect(profile.locationCountries).toEqual([]);
        });

        it('should set locationCountries from form for SELECTED_COUNTRIES', () => {
            const profile: DeepPartial<WorkerEntity> = {};
            WorkerUtils.fillLocationData(profile, {
                locationOption: WorkerLocationOptions.SELECTED_COUNTRIES,
                locationCountries: ['PL', 'DE'],
            } as any);
            expect(profile.locationCountries).toEqual(['PL', 'DE']);
        });

        it('should set locationCountries to [countryCode] for POSITION', () => {
            const profile: DeepPartial<WorkerEntity> = {};
            WorkerUtils.fillLocationData(profile, {
                locationOption: WorkerLocationOptions.POSITION,
                countryCode: 'PL',
            } as any);
            expect(profile.locationCountries).toEqual(['PL']);
        });

        it('should populate geocodedPosition and point when provided', () => {
            const profile: DeepPartial<WorkerEntity> = {};
            const geocoded = { lat: 52.23, lng: 21.01, fullAddress: 'Warsaw, Poland' };
            WorkerUtils.fillLocationData(profile, {
                locationOption: WorkerLocationOptions.POSITION,
                countryCode: 'PL',
                geocodedPosition: geocoded,
            } as any);
            expect(profile.geocodedPosition).toEqual(geocoded);
            expect(profile.fullAddress).toBe('Warsaw, Poland');
            expect(profile.point).toBeDefined();
        });

        it('should set fullAddress to empty string when geocodedPosition has no fullAddress', () => {
            const profile: DeepPartial<WorkerEntity> = {};
            WorkerUtils.fillLocationData(profile, {
                locationOption: WorkerLocationOptions.ALL_EUROPE,
                geocodedPosition: { lat: 52.23, lng: 21.01 },
            } as any);
            expect(profile.fullAddress).toBe('');
        });
    });
});
