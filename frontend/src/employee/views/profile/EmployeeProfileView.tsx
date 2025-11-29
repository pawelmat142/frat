import React, { useEffect, useState } from "react";

import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { useParams } from "react-router-dom";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { useEmployeeSearch } from "../search/EmployeeSearchProvider";
import AvatarTile from "./AvatarTile";
import CallendarTile from "./CallendarTile";
import ProfileDataTile from "./ProfileDataTile";
import AvailabilityTile from "./AvailabilityTile";
import { useTranslation } from "react-i18next";
import Chips from "global/components/chips/Chips";
import { useAuthContext } from "auth/AuthProvider";
import EditButton from "global/components/buttons/EditButton";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";

const EmployeeProfileView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName

    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<EmployeeProfileI | null>(null)

    const { t } = useTranslation();
    const { me } = useAuthContext()

    const profileCtx = useEmployeeSearch();
    const globalCtx = useGlobalContext();

    useEffect(() => {
        const initEmployeeProfile = async () => {
            if (displayName) {
                const p = profileCtx.results?.find(p => p.displayName === displayName)
                if (p) {
                    _setProfile(p);
                    return;
                }
                try {
                    setLoading(true);
                    const result = await EmployeeProfileService.getEmployeeProfileByDisplayName(displayName)
                    _setProfile(result);
                } finally {
                    setLoading(false);
                }
            }
        }
        initEmployeeProfile();
    }, []);

    const notifyProfileView = async (profile: EmployeeProfileI) => {
        if (profile?.uid) {
            await EmployeeProfileService.notifyProfileView(profile.uid);
        }
    }

    const _setProfile = (profile: EmployeeProfileI | null) => {
        setProfile(profile);
        if (profile) {
            notifyProfileView(profile); 
        }   
    }

    if (loading) {
        return <Loading />;
    }
    if (!profile) {
        return <div className="py-8 text-center secondary-text italic">Profile not found.</div>;
    }

    const goToEditForm = () => {

    }

    const isMyProfile = me?.uid === profile.uid;

    const range = DateRangeUtil.getFirstRange(profile);

    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <AvatarTile />

                    <CallendarTile range={range}></CallendarTile>

                    <ProfileDataTile profile={profile} languagesDictionary={globalCtx.dics.languages}></ProfileDataTile>

                    <AvailabilityTile profile={profile} languagesDictionary={globalCtx.dics.languages}></AvailabilityTile>

                </div>


                <div className="mt-5 mb-1">{t('employeeProfile.form.skills')}: </div>
                <Chips chips={profile.skills || []}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.form.certificates')}: </div>
                <Chips chips={profile.certificates || []}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.experience')}: </div>
            </div>

            {isMyProfile && (
                <div className="mt-10 mb-10">
                    <EditButton onClick={goToEditForm} label={t('employeeProfile.editButton')}></EditButton>
                </div>
            )}

        </div>
    );
}

export default EmployeeProfileView;