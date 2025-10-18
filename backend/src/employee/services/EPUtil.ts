import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { EmployeeProfileI, EmployeeProfileLocationOptions, EmployeeProfileStatus } from "@shared/interfaces/EmployeeProfileI";
import { UserI } from "@shared/interfaces/UserI";
import { PointUtil } from "@shared/utils/PointUtil";
import { ToastException } from "global/exceptions/ToastException";

export abstract class EPUtil {

    public static buildEmployeeProfileFromForm(user: UserI, form: EmployeeProfileForm, status: EmployeeProfileStatus): EmployeeProfileI {
        let profile: EmployeeProfileI = {
            uid: user.uid,
            status: status,
            displayName: user.displayName,
            email: user.email,

            firstName: form.firstName,
            lastName: form.lastName,
            residenceCountry: form.residenceCountry,

            skills: form.skills || [],
            certificates: form.certificates || [],
            communicationLanguages: form.communicationLanguages || [],

            locationOption: form.locationOption,
        }

        EPUtil.fillLocationData(profile, form);
        return profile;
    }

    private static fillLocationData(profile: EmployeeProfileI, form: EmployeeProfileForm): void {
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

    private static cleanLocationDataDistance(profile: EmployeeProfileI): void {
        delete profile.point;
        delete profile.pointRadius;
        delete profile.address;
    }

    private static fillLocationDataDistance(profile: EmployeeProfileI, form: EmployeeProfileForm): void {
        profile.point = PointUtil.toGeoPoint(form.locationDistancePosition!);
        profile.pointRadius = form.locationDistanceRadius;
        profile.locationCountries = EPUtil.findCountriesFromPosition(form);
        profile.address = form.locationDistancePosition.address;
    }

        // TODO implement
    private static findCountriesFromPosition(form: EmployeeProfileForm): string[] {
        return []
    }

    public static validateProfile(profile: EmployeeProfileI): void {
        if (!profile) {
            throw new ToastException("Employee profile data is required", this);
        }
        if (!profile.uid) {
            throw new ToastException("Employee profile uid is required", this);
        }
        if (!profile.status) {
            throw new ToastException("Employee profile status is required", this);
        }
        if (!profile?.email) {
            throw new ToastException("User email is required to create employee profile", this);
        }
        if (!profile?.firstName) {
            throw new ToastException("Employee profile first name is required", this);
        }
        if (!profile?.lastName) {
            throw new ToastException("Employee profile last name is required", this);
        }
        if (!profile?.residenceCountry) {
            throw new ToastException("Employee profile residence country is required", this);
        }
        if (!profile?.communicationLanguages.length) {
            throw new ToastException("At least one communication language is required", this);
        }
        EPUtil.validateLocationData(profile);
    }


    private static validateLocationData(profile: EmployeeProfileI): void {
        if (!profile.locationOption) {
            throw new ToastException("Employee profile location option is required", this);
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            if (!profile.point) {
                throw new ToastException("Location position is required for distance location option", this);
            }
            if (!profile.pointRadius || isNaN(profile.pointRadius) || profile.pointRadius <= 0) {
                throw new ToastException("Location radius is required for distance location option", this);
            }
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE) {
            if (!profile.locationCountries?.length) {
                throw new ToastException("At least one location country is required for selected countries location option", this);
            }
        }
        if (profile.locationOption === EmployeeProfileLocationOptions.ALL_EUROPE) {
            if (profile.locationCountries?.length) {
                throw new ToastException("Location countries must not be specified for all Europe location option", this);
            }
        }
    }
}