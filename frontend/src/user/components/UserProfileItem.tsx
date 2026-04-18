import { UserI } from "@shared/interfaces/UserI";
import { UserUtil } from "@shared/utils/UserUtil";
import UserItem from "user/components/UserItem";

interface Props {
    user: UserI,
    className?: string
    topRightComponent?: React.ReactNode
}

const UserProfileItem: React.FC<Props> = ({ user, className = "px-2 py-3", topRightComponent }) => {

    return (
        <div className={className}>
            <div className="flex w-full justify-between">
                <UserItem
                    user={user} size={5}
                    allowNavigate={false}
                    bottomRow={<span className="secondary-text s-font">{UserUtil.getContactInfoLine(user)}</span>}
                ></UserItem>
                {topRightComponent && <div className="pr-2 pt-1">{topRightComponent}</div>}
            </div>
        </div>
    )
}

export default UserProfileItem;