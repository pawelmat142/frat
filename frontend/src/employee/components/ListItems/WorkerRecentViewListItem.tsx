import { WorkerI } from "@shared/interfaces/WorkerI"
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import WorkerListItem from "./WorkerListItem";
import DateDisplay from "global/components/ui/DateDisplay";

interface Props {
    worker: WorkerI,
    first?: boolean,
    last?: boolean,
    className?: string,
    disableDefaultBorder?: boolean
    date: Date
}

const WorkerRecentViewListItem: React.FC<Props> = ({ worker, first, last, className, disableDefaultBorder, date }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const { me } = userCtx

    const rightSection = <div className="flex justify-end items-center gap-2">
        <div className="secondary-text s-font no-wrap pr-3">{DateDisplay({
            date,
            t,
        })} </div>
    </div>

    return <WorkerListItem
        worker={worker}
        first={first}
        last={last}
        className={className}
        disableDefaultBorder={disableDefaultBorder}
        rightSection={rightSection}
    ></WorkerListItem>

}

export default WorkerRecentViewListItem;