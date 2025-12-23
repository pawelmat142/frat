import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { EmployeeProfileAvailabilityOptions, EmployeeProfileI, EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI"
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { isOneOf, Util } from "@shared/utils/util";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EPUtil } from "employee/EPUtil";
import Chips, { ChipModes } from "global/components/chips/Chips";
import Flags from "global/components/Flags";
import { Utils } from "global/utils/utils";

interface Props {
    profile: EmployeeProfileI,
    languagesDictionary: DictionaryI
    first?: boolean,
    last?: boolean,
}

const EmployeeProfileTile: React.FC<Props> = ({ profile, languagesDictionary, first, last }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const srcs = new Set<string>();

    Utils.prepareFlagSrcs(profile.communicationLanguages || [], languagesDictionary).forEach(src => srcs.add(src));

    const name = EPUtil.prepareName(profile);

    const getAvailableFromDate = (): string => {
        const range = DateRangeUtil.toDateRange(profile.availabilityDateRanges![0]);
        const from = Util.displayDate(range!.start!);
        return from;
    }

    const goToProfileView = (profile: EmployeeProfileI) => {
        navigate(Path.getEmployeeProfilePath(profile.displayName!));
    }

    // const distance = EPUtil.getDistanceFromToInMeters(profile.point, EPUtil.getCurrentLocationPoint());

    return (
        <div className={`tile ripple${first ? " first" : ""}${last ? " last" : ""}`} onClick={() => goToProfileView(profile)}>

            <div className="tile-avatar">
                {/* TODO?? */}
            </div>

            <div className="tile-content">

                <div className="tile-content-row top">
                    <div className="tile-content-title">{profile.displayName}
                        {name && <span>{name}</span>}
                    </div>

                    <div>
                        <Flags languages={profile.communicationLanguages} />
                    </div>

                </div>

                <div className="tile-content-row mid items-center justify-between w-full">
                    <div className="">{profile.email}</div>

                    <div className="small-font text-right">

                        {/* PLACE */}
                        <span className="mr-2">
                            
                            {profile.locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                                <span>{t('employeeProfile.locationOptions.anywhere')}</span>
                            )}

                            {/* TODO display distance */}
                        </span>

                        {/* DATE */}
                        <span>
                            {profile.availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && <span className="small-font text-right">{t('others.availableAnytimeShort')}</span>}
                            {isOneOf([
                                EmployeeProfileAvailabilityOptions.DATE_RANGES,
                                EmployeeProfileAvailabilityOptions.FROM_DATE
                            ], profile.availabilityOption) && <span >{t('common.from')} {getAvailableFromDate()}</span>}
                        </span>
                    </div>
                
                </div>

                <div className="tile-content-row bottom">

                    <div className="flex">
                        <Chips chips={profile.skills || []} mode={ChipModes.TERTIARY}></Chips>
                        <Chips className="ml-5" chips={profile.certificates || []} mode={ChipModes.SECONDARY}></Chips>
                    </div>

                    <div>
                        <span className="mr-2 small-font">{t('employeeProfile.views')}: {profile.views?.length || 0}</span>
                        <span>{Util.displayDate(profile.createdAt)}</span>
                    </div>

                </div>
            </div>

        </div>
    )

}

export default EmployeeProfileTile;