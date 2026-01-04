import { WorkerI } from "@shared/interfaces/WorkerProfileI";
import React from "react";
import { WorkerUtil } from "@shared/utils/WorkerUtil";
import { useTranslation } from "react-i18next";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";
import Flags from "global/components/Flags";
import { Utils } from "global/utils/utils";
import { DateUtil } from "@shared/utils/DateUtil";

interface ProfileDataTileProps {
    profile: WorkerI
    languagesDictionary?: DictionaryI | null
}

const ProfileDataTile: React.FC<ProfileDataTileProps> = ({ profile, languagesDictionary }) => {

    const { t } = useTranslation();

    if (!languagesDictionary) {
        return (<Loading></Loading>);
    }

    const languageNames = Utils.prepareLanguageNames(t, profile.communicationLanguages, languagesDictionary);

    return (
        <div className="square-tile data-tile p-1">

            <div>
                <div>
                    <span className="tile-content-title">{profile.displayName}</span>
                    <span>{WorkerUtil.displayName(profile)}</span>
                </div>
                <div className="xs-font secondary-text">{profile.email}</div>
            </div>


            <div>
                <div className="mb-1">{t('employeeProfile.form.communicationLanguages')}</div>
                <div className="ml-1">
                    <Flags languages={profile.communicationLanguages} />
                    <div className="xs-font secondary-text mt-1">{languageNames}</div>
                </div>
            </div>

            <div className="w-full">
                <div className="xs-font secondary-text">{t('employeeProfile.joined')} {DateUtil.displayDate(profile.createdAt)}</div>

                <div className="flex w-full gap-5">
                    <span className="xs-font secondary-text">{t('employeeProfile.views')}: {profile.views?.length || 0}</span>
                    <span className="xs-font secondary-text">{t('employeeProfile.jobs')}: {profile.jobs?.length || 0}</span>
                </div>

            </div>

        </div>
    );
}

export default ProfileDataTile;