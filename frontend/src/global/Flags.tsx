import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { Utils } from "./utils";

interface Props {
    languagesDictionary: DictionaryI
    languages: string[]
    size?: number,
}

const Flags: React.FC<Props> = ({ languages, languagesDictionary, size = 20 }) => {

    const srcs = new Set<string>();

    Utils.prepareFlagSrcs(languages || [], languagesDictionary).forEach(src => srcs.add(src));

    return (
        <div className="flex">
            {Array.from(srcs).map((src, index) => {
                const first = index === 0;
                return (
                    <img key={index} className="pp-dropdown-icon" src={src} alt={"flag-" + index} style={{ height: size, paddingLeft: first ? 0 : size / 2 + 'px' }} />
                )
            })}
        </div>
    )

}

export default Flags;