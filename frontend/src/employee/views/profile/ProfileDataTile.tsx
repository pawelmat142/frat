import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import React from "react";
import { EPUtil } from "employee/EPUtil";
import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";
import Flags from "global/Flags";

interface ProfileDataTileProps {
    profile: EmployeeProfileI
    languagesDictionary?: DictionaryI | null
}

const ProfileDataTile: React.FC<ProfileDataTileProps> = ({ profile, languagesDictionary }) => {

    const { t } = useTranslation();

    if (!languagesDictionary) {
        return (<Loading></Loading>);
    }

    const languageNames = profile.communicationLanguages.map(code => {
        return languagesDictionary.elements.find(el => el.code === code)?.values.NAME;
    }).filter(name => name !== undefined)
        .map(name => t(name))
        .join(', ');

    return (
        <div className="square-tile data-tile p-1">

            <div>
                <div>
                    <span className="tile-content-title">{profile.displayName}</span>
                    <span>{EPUtil.prepareName(profile)}</span>
                </div>
                <div className="xs-font secondary-text">{profile.email}</div>
            </div>


            <div>
                <div className="mb-1">{t('employeeProfile.form.communicationLanguages')}</div>
                <div className="ml-1">
                    <Flags languages={profile.communicationLanguages} languagesDictionary={languagesDictionary} />
                    <div className="xs-font secondary-text mt-1">{languageNames}</div>

                </div>
            </div>

            <div className="w-full">
                <div className="xs-font secondary-text">{t('employeeProfile.joined')} {Util.displayDate(profile.createdAt)}</div>

                <div className="flex w-full gap-5">
                    <span className="xs-font secondary-text">{t('employeeProfile.views')}: {profile.views?.length || 0}</span>
                    <span className="xs-font secondary-text">{t('employeeProfile.jobs')}: {profile.jobs?.length || 0}</span>
                </div>

            </div>

        </div>
    );
}

export default ProfileDataTile;