import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { EmployeeProfileAvailabilityOptions, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI"
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { isOneOf, Util } from "@shared/utils/util";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";

interface Props {
    employeeProfile: EmployeeProfileI,
    languagesDictionary: DictionaryI
}

const EmployeeLocationTile: React.FC<Props> = ({ employeeProfile, languagesDictionary }) => {

    const navigate = useNavigate();
    
    const srcs = new Set<string>();
    // const residenceFlagSrc = languagesDictionary.elements.find(el => el.values.COUNTRY_CODE === employeeProfile.residenceCountry)?.values.SRC;
    // if (residenceFlagSrc) {
    //     srcs.add(residenceFlagSrc);
    // }
    employeeProfile.communicationLanguages?.forEach(lang => {
        const flagSrc = languagesDictionary?.elements.find(el => el.code === lang)?.values.SRC;
        if (flagSrc) {
            srcs.add(flagSrc);
        }
    });

    const prepareName = () => {
        let result = ``
        if (employeeProfile.firstName) {
            result += employeeProfile.firstName
        }
        if (employeeProfile.lastName) {
            if (employeeProfile.firstName) {
                result += ` `
            }
            result += `${employeeProfile.lastName}`
        }
        return `, (${result})`
    }

    const name = prepareName();

    const getAvailableFromDate = (): string => {
        const range = DateRangeUtil.toDateRange(employeeProfile.availabilityDateRanges![0]);
        const from = Util.displayDate(range!.start!);
        return from;
    }

    const goToProfileView = (profile: EmployeeProfileI) => {
        navigate(Path.getEmployeeProfilePath(profile.displayName!));
    }


    return (
        <div className="tile clickable" onClick={() => goToProfileView(employeeProfile)}>

            <div className="tile-avatar">

            </div>

            <div className="tile-content">

                <div className="tile-content-row top">
                    <div className="tile-content-title">{employeeProfile.displayName}
                        {name && <span>{name}</span>}
                    </div>
                    <div className="flex">
                        {Array.from(srcs).map((src, index) => (
                            <img key={index} className="pp-dropdown-icon pl-4" src={src} alt={"flag-" + index} />
                        ))}
                    </div>

                </div>

                <div className="tile-content-row mid items-center">
                    <div className="">{employeeProfile.email}</div>

                    <div className="">
                        {employeeProfile.availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && <span className="small-font">Available anytime</span>}
                        {isOneOf([
                            EmployeeProfileAvailabilityOptions.DATE_RANGES, 
                            EmployeeProfileAvailabilityOptions.FROM_DATE
                            ], employeeProfile.availabilityOption) && <span className="small-font">Available on from {getAvailableFromDate()}</span>}
                    </div>
                </div>

                <div className="tile-content-row bottom">

                    <div className="flex">
                        <div className="chip-container">
                            {Array.isArray(employeeProfile.skills) && !!employeeProfile.skills.length
                                && employeeProfile.skills.map(v => (
                                    <div key={String(v)} className="chip">
                                        {v}
                                    </div>
                                ))
                            }
                        </div>
                        <div className="ml-10 chip-container">
                            {Array.isArray(employeeProfile.certificates) && !!employeeProfile.certificates.length
                                && employeeProfile.certificates.map(v => (
                                    <div key={String(v)} className="chip">
                                        {v}
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="">{Util.displayDate(employeeProfile.createdAt)}</div>

                </div>
            </div>

        </div>
    )

}

export default EmployeeLocationTile;