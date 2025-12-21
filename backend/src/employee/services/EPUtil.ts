import { DateRangeI, EmployeeProfileAvailabilityOptions, EmployeeProfileFormDto, EmployeeProfileLocationOptions, EmployeeProfileStatus } from "@shared/interfaces/EmployeeProfileI";
import { UserI } from "@shared/interfaces/UserI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { PointUtil } from "@shared/utils/PointUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial } from "typeorm";

export abstract class EPUtil {

    public static buildEmployeeProfileFromForm(user: UserI, form: EmployeeProfileFormDto, status: EmployeeProfileStatus): DeepPartial<EmployeeProfileEntity> {
        let profile: DeepPartial<EmployeeProfileEntity> = {
            employeeProfileId: 0,
            uid: user.uid,
            status: status,
            displayName: user.displayName,
            email: user.email,

            firstName: form.firstName,
            lastName: form.lastName,
            // residenceCountry: form.residenceCountry,

            skills: form.skills || [],
            certificates: form.certificates || [],
            communicationLanguages: form.communicationLanguages || [],

            locationOption: form.locationOption,
        }

        EPUtil.fillLocationData(profile, form);
        return profile;
    }

    public static fillLocationData(profile: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileFormDto): void {
        if (form.locationOption === EmployeeProfileLocationOptions.ALL_EUROPE) {
            profile.locationCountries = []
            EPUtil.cleanLocationDataDistance(profile);
        }
        if (form.locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE) {
            profile.locationCountries = form.locationCountries || []
            EPUtil.cleanLocationDataDistance(profile);
        }
        if (form.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            EPUtil.fillLocationDataDistance(profile, form);
        }
    }

    public static cleanLocationDataDistance(profile: DeepPartial<EmployeeProfileEntity>): void {
        delete profile.point;
        delete profile.pointRadius;
        delete profile.street;
        delete profile.city
        delete profile.fullAddress
        delete profile.district
        delete profile.postcode
        delete profile.state
    }

    private static fillLocationDataDistance(profile: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileFormDto): void {
        profile.point = PointUtil.toGeoPoint({
            lat: form.geocodedPosition!.lat,
            lng: form.geocodedPosition!.lng,
        });
        profile.pointRadius = form.locationDistanceRadius;
        profile.street = form.geocodedPosition?.street;
        profile.city = form.geocodedPosition?.city;
        profile.district = form.geocodedPosition?.district;
        profile.state = form.geocodedPosition?.state;
        profile.postcode = form.geocodedPosition?.postcode;
        profile.fullAddress = form.geocodedPosition?.fullAddress || '';
    }

    public static validateProfile(profile: DeepPartial<EmployeeProfileEntity>): void {
        if (!profile) {
            throw new ToastException('employeeProfile.error.dataRequired', this);
        }
        if (!profile.uid) {
            throw new ToastException('employeeProfile.error.uidRequired', this);
        }
        if (!profile.status) {
            throw new ToastException('employeeProfile.error.statusRequired', this);
        }
        if (!profile?.email) {
            throw new ToastException('employeeProfile.error.emailRequired', this);
        }
        if (!profile?.firstName) {
            throw new ToastException('employeeProfile.error.firstNameRequired', this);
        }
        if (!profile?.lastName) {
            throw new ToastException('employeeProfile.error.lastNameRequired', this);
        }
        if (!profile?.communicationLanguages.length) {
            throw new ToastException('employeeProfile.error.communicationLanguagesRequired', this);
        }

        // Availability validation
        if (profile.availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE) {
            if (!profile.availabilityDateRanges || profile.availabilityDateRanges.length !== 1) {
                throw new ToastException('employeeProfile.error.availabilityFromDateRequired', this);
            }
            const range = profile.availabilityDateRanges[0];
            // Obsługa zarówno DateRangeI (dateRange: string) jak i DateRange (start: Date)
            const hasStart = (
                range && (
                    (typeof range.dateRange === 'string' && range.dateRange) ||
                    ('start' in range && range.start)
                )
            );
            if (!hasStart) {
                throw new ToastException('employeeProfile.error.availabilityFromDateRequired', this);
            }
        }
        if (profile.availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES) {
            if (!profile.availabilityDateRanges?.length) {
                throw new ToastException('employeeProfile.error.availabilityDateRangesRequired', this);
            }
            // Przynajmniej jeden zakres z start i end (DateRange) lub dateRange (DateRangeI)
            const valid = profile.availabilityDateRanges?.length && profile.availabilityDateRanges.every(r => {
                const dateRange = DateRangeUtil.toDateRange(r as DateRangeI);
                if (dateRange.start && dateRange.end) {
                    return true;
                }
                return false;
            });
            if (!valid) {
                throw new ToastException('employeeProfile.error.availabilityDateRangeStartEndRequired', this);
            }
        }
        // Additional location validation
        if (profile.locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE) {
            if (!profile.locationCountries || profile.locationCountries.length === 0) {
                throw new ToastException('employeeProfile.error.locationCountryRequired', this);
            }
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            if (!profile.point) {
                throw new ToastException('employeeProfile.error.locationPositionRequired', this);
            }
            if (!profile.pointRadius || isNaN(profile.pointRadius) || profile.pointRadius <= 0) {
                throw new ToastException('employeeProfile.error.locationRadiusRequired', this);
            }
        }

        EPUtil.validateLocationData(profile);
    }


    private static validateLocationData(profile: DeepPartial<EmployeeProfileEntity>): void {
        if (!profile.locationOption) {
            throw new ToastException('employeeProfile.error.locationOptionRequired', this);
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            if (!profile.point) {
                throw new ToastException('employeeProfile.error.locationPositionRequired', this);
            }
            if (!profile.pointRadius || isNaN(profile.pointRadius) || profile.pointRadius <= 0) {
                throw new ToastException('employeeProfile.error.locationRadiusRequired', this);
            }
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE) {
            if (!profile.locationCountries?.length) {
                throw new ToastException('employeeProfile.error.locationCountryRequired', this);
            }
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.ALL_EUROPE) {
            if (profile.locationCountries?.length) {
                throw new ToastException('employeeProfile.error.locationCountriesMustNotBeSpecified', this);
            }
        }
    }
}