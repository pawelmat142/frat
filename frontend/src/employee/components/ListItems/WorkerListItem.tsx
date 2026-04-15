import { WorkerI } from "@shared/interfaces/WorkerI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import ListItem from "global/components/ListItem";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import WorkerStatItems from "../WorkerStatItems";

interface Props {
    worker: WorkerI,
    first?: boolean,
    last?: boolean,
    className?: string,
    disableDefaultBorder?: boolean
    rightSection?: React.ReactNode
}

const WorkerListItem: React.FC<Props> = ({ worker, first, last, className, disableDefaultBorder, rightSection }) => {

    const navigate = useNavigate();

    const goToProfileView = () => {
        navigate(Path.getWorkerProfilePath(worker.displayName!));
    }

    return (
        <div onClick={goToProfileView} className={className}>
            <ListItem
                imgUrl={worker.avatarRef?.url || AVATAR_MOCK}
                topLeft={worker.displayName}
                bottomLeft={<WorkerStatItems worker={worker} />}
                first={first}
                last={last}
                rightSection={rightSection}
                disableDefaultBorder={disableDefaultBorder}
            ></ListItem>
        </div>

    )

}

export default WorkerListItem;