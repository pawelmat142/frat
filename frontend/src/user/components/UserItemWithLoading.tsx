import { UserI } from "@shared/interfaces/UserI";
import { useEffect, useState } from "react";
import UserItem from "./UserItem";
import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { UserPublicService } from "user/services/UserPublicService";
import { useUserContext } from "user/UserProvider";

interface Props {
    uid: string,
    size?: number,
    showNumber?: boolean
    }

const UserItemWithLoading: React.FC<Props> = ({ uid, size = 3.5, showNumber = false }) => {

    if (!uid) return null;

    const { t } = useTranslation()
    const [user, setUser] = useState<UserI | null>(null);
    const [loading, setLoading] = useState(true);
    const { me } = useUserContext();

    // TODO ADD USERS STORAGE IN USER CTX 

    useEffect(() => {
        const initUser = async () => {
            if (me?.uid === uid) {
                setUser(me);
                setLoading(false);
                return;
            }

            try {
                const fetchedUser = await UserPublicService.fetchUser(uid);
                setUser(fetchedUser);
            } finally {
                setLoading(false);
            }
        }
        initUser(); 
    }, [])

    if (loading) {
        return <Loading></Loading>
    }

    if (!user) {
        return <span>{t(`user.error.notFound`)}</span>
    }

    return <UserItem user={user} size={size} showNumber={showNumber}></UserItem>
}

export default UserItemWithLoading;