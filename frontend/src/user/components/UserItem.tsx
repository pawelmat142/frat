import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import { AVATAR_MOCK } from "./AvatarTile";
import { Path } from "../../path";
import ListItemImg from "global/components/ListItemImg";

interface Props {
    user: UserI
    size?: number //rem
    showNumber?: boolean
    allowNavigate?: boolean
    bottomRow?: React.ReactNode
}

const UserItem: React.FC<Props> = ({ user, size = 3.5, showNumber = false, allowNavigate = true, bottomRow }) => {

    const navigate = useNavigate();

    return (
        <span className="ripple flex gap-2 items-center w-full" onClick={() => {
            if (!allowNavigate) return;
            navigate(Path.getProfilePath(user?.uid))
        }}>
            <ListItemImg imgUrl={user?.avatarRef?.url || AVATAR_MOCK} size={size} />
            <div>
                <div className="x-font">{user?.displayName}</div>
                {bottomRow ? (
                    bottomRow
                ) : (
                    showNumber && <div className="small-font secondary-text">{user?.email}</div>
                )}
            </div>
        </span>
    )
}

export default UserItem;