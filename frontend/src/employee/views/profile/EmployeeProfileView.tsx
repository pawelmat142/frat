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
import { DictionaryService } from "global/services/DictionaryService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { useTranslation } from "react-i18next";
import Chips from "global/components/chips/Chips";

const EmployeeProfileView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<EmployeeProfileI | null>(null)
    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            const dictionary = await DictionaryService.getDictionary('LANGUAGES');
            setLanguagesDictionary(dictionary);
            setLoading(false);
        }
        initDictionary();
    }, []);

    const profileCtx = useEmployeeSearch();

    useEffect(() => {
        const initEmployeeProfile = async () => {
            if (displayName) {
                const p = profileCtx.results?.find(p => p.displayName === displayName)
                if (p) {
                    setProfile(p);
                    return;
                }
                try {
                    setLoading(true);
                    const result = await EmployeeProfileService.getEmployeeProfileByDisplayName(displayName)
                    setProfile(result);
                } finally {
                    setLoading(false);
                }
            }
        }
        initEmployeeProfile();
    }, []);


    if (loading) {
        return <Loading />;
    }
    if (!profile) {
        return <div className="py-8 text-center secondary-text italic">Profile not found.</div>;
    }



    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <AvatarTile />

                    <CallendarTile profile={profile}></CallendarTile>

                    <ProfileDataTile profile={profile} languagesDictionary={languagesDictionary}></ProfileDataTile>

                    <AvailabilityTile profile={profile} languagesDictionary={languagesDictionary}></AvailabilityTile>

                </div>


                <div className="mt-5 mb-1">{t('employeeProfile.form.skills')}: </div>
                <Chips chips={profile.skills || []}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.form.certificates')}: </div>
                <Chips chips={profile.certificates || []}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.experience')}: </div>
            </div>

        </div>
    );
}

export default EmployeeProfileView;