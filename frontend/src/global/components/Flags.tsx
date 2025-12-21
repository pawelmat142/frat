import { Utils } from "global/utils/utils";
import { useGlobalContext } from "../providers/GlobalProvider";
import Loading from "./Loading";

interface Props {
    languages: string[]
    size?: number,
}

const Flags: React.FC<Props> = ({ languages, size = 20 }) => {
    const globalCtx = useGlobalContext();

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading />;
    }

    const languagesDictionary = globalCtx.dics.languages

    const srcs = new Set<string>();

    Utils.prepareFlagSrcs(languages || [], languagesDictionary).forEach(src => srcs.add(src));

    return (
        <div className="flex">
            {Array.from(srcs).map((src, index) => {
                const first = index === 0;
                return (
                    <img key={index} className="pp-dropdown-icon" src={src} alt={"flag-" + index} style={{ height: size, paddingLeft: first ? 0 : size / 4 + 'px' }} />
                )
            })}
        </div>
    )

}

export default Flags;