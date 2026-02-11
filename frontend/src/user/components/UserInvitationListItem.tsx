import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import UserItem from "./UserItem";
import IconButton from "global/components/controls/IconButon";
import { FaUserPlus } from "react-icons/fa";
import { useAuthContext } from "auth/AuthProvider";
import { FriendsService } from "friends/services/FriendsService";
import { useState } from "react";
import Loading from "global/components/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";

interface Props {
    user: UserI
}

const UserInvitationListItem: React.FC<Props> = ({ user }) => {

    const navigate = useNavigate();
    const { me } = useAuthContext();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const sendInvite = async () => {
        try {
            setLoading(true);
            const friendship = await FriendsService.sendInvite(user.uid);
            console.log('Invitation sent:', friendship);
            toast.success(t('friends.invitationSent'));
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading></Loading>
    }

    const isMe = me?.uid === user.uid;
    const isFriend = false;
    const isInvited = false;
    const isInvitationReceived = false;
    
    const canInvite = !isMe && !isFriend && !isInvited && !isInvitationReceived;

    return (
        <div className="flex justify-between items-center w-full" onClick={() => navigate(Path.getAccountPath(user.uid))}>
            <UserItem user={user} showNumber={true} allowNavigate={false}></UserItem>

            {canInvite && <IconButton onClick={(e) => {
                e.stopPropagation();
                sendInvite();
            }}
                icon={<FaUserPlus size={20} />}
            ></IconButton>}     
        </div>
    )
}

export default UserInvitationListItem;