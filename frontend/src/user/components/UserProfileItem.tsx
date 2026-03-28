import { UserI } from "@shared/interfaces/UserI";
import { UserUtil } from "@shared/utils/UserUtil";
import UserItem from "user/components/UserItem";

interface Props {
    user: UserI
}

const UserProfileItem: React.FC<Props> = ({ user }) => {

    return (
        <div className="px-2 py-3">
            <UserItem user={user} size={5} allowNavigate={false}
                bottomRow={<span>{UserUtil.getContactInfoLine(user)}</span>}></UserItem>
        </div>
    )
}

export default UserProfileItem;