import { EmployeeProfileForm, EmployeeProfileLocationOptions, EmployeeProfileStatus } from "@shared/interfaces/EmployeeProfileI";
import { UserI } from "@shared/interfaces/UserI";
import { PointUtil } from "@shared/utils/PointUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial } from "typeorm";

export abstract class EPUtil {

    public static buildEmployeeProfileFromForm(user: UserI, form: EmployeeProfileForm, status: EmployeeProfileStatus): DeepPartial<EmployeeProfileEntity> {
        let profile: DeepPartial<EmployeeProfileEntity> = {
            employeeProfileId: 0,
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

    public static fillLocationData(profile: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileForm): void {
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

    private static cleanLocationDataDistance(profile: DeepPartial<EmployeeProfileEntity>): void {
        delete profile.point;
        delete profile.pointRadius;
        delete profile.address;
    }

    private static fillLocationDataDistance(profile: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileForm): void {
        profile.point = PointUtil.toGeoPoint(form.locationDistancePosition!);
        profile.pointRadius = form.locationDistanceRadius;
        profile.address = form.locationDistancePosition.address;
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
        if (!profile?.residenceCountry) {
            throw new ToastException('employeeProfile.error.residenceCountryRequired', this);
        }
        if (!profile?.communicationLanguages.length) {
            throw new ToastException('employeeProfile.error.communicationLanguagesRequired', this);
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