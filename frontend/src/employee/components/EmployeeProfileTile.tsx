import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI"
import { Util } from "@shared/utils/util";
import { useState } from "react";

interface Props {
    employeeProfile: EmployeeProfileI,
    languagesDictionary: DictionaryI
}

const EmployeeLocationTile: React.FC<Props> = ({ employeeProfile, languagesDictionary }) => {

    const [loading, setLoading] = useState(false);

    const srcs = new Set<string>();
    const residenceFlagSrc = languagesDictionary.elements.find(el => el.values.COUNTRY_CODE === employeeProfile.residenceCountry)?.values.SRC;
    if (residenceFlagSrc) {
        srcs.add(residenceFlagSrc);
    }
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

    return (
        <div className="tile">

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

                <div className="tile-content-row mid">
                    <div className="">{employeeProfile.email}</div>
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