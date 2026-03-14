import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import { AVATAR_MOCK } from "./AvatarTile";
import { Path } from "../../path";
import ListItemImg from "global/components/ListItemImg";
import { UserUtil } from "@shared/utils/UserUtil";
import { AppConfig } from "@shared/AppConfig";

interface Props {
    user: UserI
    size?: number //rem
    showNumber?: boolean
    allowNavigate?: boolean
    bottomRow?: React.ReactNode
}

const UserItem: React.FC<Props> = ({ user, size = AppConfig.DEFAULT_AVATAR_SIZE, showNumber = false, allowNavigate = true, bottomRow }) => {

    const navigate = useNavigate();

    return (
        <span className="ripple flex gap-3 items-center w-full" onClick={() => {
            if (!allowNavigate) return;
            navigate(Path.getProfilePath(user?.uid))
        }}>
            <ListItemImg imgUrl={user?.avatarRef?.url || AVATAR_MOCK} size={size} />
            <div>
                <div className="font-medium">{user?.displayName}</div>
                {bottomRow ? (
                    bottomRow
                ) : (
                    showNumber && !!user && <div className="xs-font secondary-text">{UserUtil.getContactInfoLine(user)}</div>
                )}
            </div>
        </span>
    )
}

export default UserItem;