import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import React from "react";
import { EPUtil } from "employee/EPUtil";
import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";

interface ProfileDataTileProps {
    profile: EmployeeProfileI
}

const ProfileDataTile: React.FC<ProfileDataTileProps> = ({ profile }) => {

    const { t } = useTranslation();

    return (
        <div className="square-tile data-tile p-1">

            <div className="nowrap ">
                <span className="tile-content-title">{profile.displayName}</span>
                <span>{EPUtil.prepareName(profile)}</span>
            </div>

            <div className="xs-font secondary-text">{profile.email}</div>

            <div className="xs-font secondary-text">{t('employeeProfile.joined')} {Util.displayDate(profile.createdAt)}</div>


        </div>
    );
}

export default ProfileDataTile;