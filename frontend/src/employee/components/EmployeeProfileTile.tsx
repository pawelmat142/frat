import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { EmployeeProfileAvailabilityOptions, EmployeeProfileI, EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI"
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { isOneOf } from "@shared/utils/util";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EPUtil } from "employee/EPUtil";
import Chips, { ChipModes } from "global/components/chips/Chips";
import Flags from "global/components/Flags";
import { Utils } from "global/utils/utils";
import { useUserContext } from "user/UserProvider";
import { DateRange, Place } from "@mui/icons-material";
import { DateUtil } from "@shared/utils/DateUtil";

interface Props {
    profile: EmployeeProfileI,
    languagesDictionary: DictionaryI
    first?: boolean,
    last?: boolean,
}

const EmployeeProfileTile: React.FC<Props> = ({ profile, languagesDictionary, first, last }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const srcs = new Set<string>();

    Utils.prepareFlagSrcs(profile.communicationLanguages || [], languagesDictionary).forEach(src => srcs.add(src));

    const name = EPUtil.prepareName(profile);

    const getAvailableFromDate = (): string => {
        const range = DateRangeUtil.toDateRange(profile.availabilityDateRanges![0]);
        const from = DateUtil.displayDate(range!.start!);
        return from;
    }

    const goToProfileView = (profile: EmployeeProfileI) => {
        navigate(Path.getEmployeeProfilePath(profile.displayName!));
    }

    const distance = userCtx.position && profile.point
        ? EPUtil.getDistanceFromToInMeters(userCtx.position, {
            lat: profile.point.coordinates[1],
            lng: profile.point.coordinates[0]
        })
        : null;

    const formattedDistance = distance ? EPUtil.formatDistance(distance) : null;

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


                    <div>
    {/* DATE */}
                        <span>
                            <DateRange fontSize="inherit" className="secondary-text mr-1" />
                            <span>
                                {profile.availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && <span className="small-font">{t('others.availableAnytimeShort')}</span>}
                                {isOneOf([
                                    EmployeeProfileAvailabilityOptions.DATE_RANGES,
                                    EmployeeProfileAvailabilityOptions.FROM_DATE
                                ], profile.availabilityOption) && <span className="small-font">{t('common.from')} {getAvailableFromDate()}</span>}
                            </span>
                        </span>

                        <span>
                            <Place fontSize="inherit" className="secondary-text ml-3" />
                            {profile.locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                                <span className="small-font">{t('common.anywhere')}</span>
                            )}
                            {formattedDistance && (
                                <span className="small-font">{formattedDistance}</span>
                            )}
                        </span>

                    </div>

                    <div>
                        <span className="small-font">{t('employeeProfile.views')}: {profile.views?.length || 0}</span>
                    </div>

                </div>

                <div className="tile-content-row bottom">

                    <div className="flex">
                        <Chips chips={profile.skills || []} mode={ChipModes.TERTIARY}></Chips>
                        <Chips className="ml-5" chips={profile.certificates || []} mode={ChipModes.SECONDARY}></Chips>
                    </div>

                    <div>
                        <span>{DateUtil.displayDate(profile.createdAt)}</span>
                    </div>

                </div>
            </div>

        </div>
    )

}

export default EmployeeProfileTile;