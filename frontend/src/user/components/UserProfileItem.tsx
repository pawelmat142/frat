import { UserI } from "@shared/interfaces/UserI";
import { UserUtil } from "@shared/utils/UserUtil";
import UserItem from "user/components/UserItem";
import AvatarTile from "./AvatarTile";

interface Props {
    user: UserI,
    className?: string
    topRightComponent?: React.ReactNode,
    editableAvatar?: boolean
}

const UserProfileItem: React.FC<Props> = ({ user, className, topRightComponent, editableAvatar = false }) => {

    return (
        <div className={className}>
            <div className="flex w-full justify-between">
                <div className="pt-3 pl-3">
                    <UserItem
                        user={user} size={5}
                        allowNavigate={false}
                        editableAvatar={editableAvatar}
                        bottomRow={<span className="secondary-text s-font">{UserUtil.getContactInfoLine(user)}</span>}
                    ></UserItem>
                </div>
                {topRightComponent && <div>{topRightComponent}</div>}
            </div>
        </div>
    )
}

export default UserProfileItem;