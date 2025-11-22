import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { EmployeeProfileAvailabilityOptions, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI"
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { isOneOf, Util } from "@shared/utils/util";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { Utils } from "global/utils";
import { useTranslation } from "react-i18next";
import { EPUtil } from "employee/EPUtil";
import Chips from "global/components/chips/Chips";

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
                    <div className="flex">
                        {Array.from(srcs).map((src, index) => (
                            <img key={index} className="pp-dropdown-icon pl-4" src={src} alt={"flag-" + index} />
                        ))}
                    </div>

                </div>

                <div className="tile-content-row mid items-center justify-between w-full">
                    <div className="">{profile.email}</div>

                        {profile.availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && <span className="small-font text-right">{t('others.availableAnytimeShort')}</span>}
                        {isOneOf([
                            EmployeeProfileAvailabilityOptions.DATE_RANGES, 
                            EmployeeProfileAvailabilityOptions.FROM_DATE
                            ], profile.availabilityOption) && <span className="small-font text-right">{t('common.from')} {getAvailableFromDate()}</span>}
                </div>

                <div className="tile-content-row bottom">

                    <div className="flex">
                        <Chips chips={profile.skills || []}></Chips>
                        <Chips className="ml-10" chips={profile.certificates || []}></Chips>
                    </div>

                    <div className="">{Util.displayDate(profile.createdAt)}</div>

                </div>
            </div>

        </div>
    )

}

export default EmployeeProfileTile;