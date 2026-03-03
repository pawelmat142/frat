import { DateRangeI, WorkerAvailabilityOptions, WorkerFormDto, WorkerLocationOptions, WorkerStatus } from "@shared/interfaces/WorkerProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { WorkerEntity } from "employee/model/WorkerEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial } from "typeorm";

export abstract class WorkerUtil {

    public static fillLocationData(profile: DeepPartial<WorkerEntity>, form: WorkerFormDto): void {
        profile.locationOption = form.locationOption;
        if (form.geocodedPosition) {
            profile.geocodedPosition = form.geocodedPosition;
            profile.point = PositionUtil.toGeoPoint({
                lat: form.geocodedPosition.lat,
                lng: form.geocodedPosition.lng,
            });
            profile.fullAddress = form.geocodedPosition.fullAddress || '';
        }
        
        if (form.locationOption === WorkerLocationOptions.ALL_EUROPE) {
            profile.locationCountries = []
        }
        if (form.locationOption === WorkerLocationOptions.SELECTED_COUNTRIES) {
            profile.locationCountries = form.locationCountries || []
        }
        if (form.locationOption === WorkerLocationOptions.POSITION) {
            profile.locationCountries = [form.countryCode]
        }
    }


    public static validateProfile(profile: DeepPartial<WorkerEntity>): void {
        if (!profile) {
            throw new ToastException('employeeProfile.error.dataRequired', this);
        }
        if (!profile.uid) {
            throw new ToastException('employeeProfile.error.uidRequired', this);
        }
        if (!profile.status) {
            throw new ToastException('employeeProfile.error.statusRequired', this);
        }

        if (!profile?.fullName) {
            throw new ToastException('employeeProfile.error.fullNameRequired', this);
        }
        if (!profile?.phoneNumber || !profile.phoneNumber.number) {
            throw new ToastException('employeeProfile.error.phoneNumberRequired', this);
        }
        if (!profile?.email) {
            throw new ToastException('employeeProfile.error.emailRequired', this);
        }
        if (!profile?.communicationLanguages.length) {
            throw new ToastException('employeeProfile.error.communicationLanguagesRequired', this);
        }
        if (!profile?.avatarRef) {
            throw new ToastException('employeeProfile.error.avatarRefRequired', this);
        }

        // Availability validation
        if (profile.availabilityOption === WorkerAvailabilityOptions.FROM_DATE) {
            if (!profile.startDate) {
                throw new ToastException('employeeProfile.error.availabilityFromDateRequired', this);
            }
        }
        if (profile.availabilityOption === WorkerAvailabilityOptions.DATE_RANGES) {
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
        if (profile.locationOption === WorkerLocationOptions.SELECTED_COUNTRIES) {
            if (!profile.locationCountries || profile.locationCountries.length === 0) {
                throw new ToastException('employeeProfile.error.locationCountryRequired', this);
            }
        }
        if (profile.locationOption === WorkerLocationOptions.POSITION) {
            if (!profile.point) {
                throw new ToastException('employeeProfile.error.locationPositionRequired', this);
            }
        }

        WorkerUtil.validateLocationData(profile);
    }


    private static validateLocationData(profile: DeepPartial<WorkerEntity>): void {
        if (!profile.locationOption) {
            throw new ToastException('employeeProfile.error.locationOptionRequired', this);
        }
        if (profile.locationOption === WorkerLocationOptions.POSITION) {
            if (!profile.point) {
                throw new ToastException('employeeProfile.error.locationPositionRequired', this);
            }
        }
        if (profile.locationOption === WorkerLocationOptions.SELECTED_COUNTRIES) {
            if (!profile.locationCountries?.length) {
                throw new ToastException('employeeProfile.error.locationCountryRequired', this);
            }
        }
        if (profile.locationOption === WorkerLocationOptions.ALL_EUROPE) {
            if (profile.locationCountries?.length) {
                throw new ToastException('employeeProfile.error.locationCountriesMustNotBeSpecified', this);
            }
        }
    }
}