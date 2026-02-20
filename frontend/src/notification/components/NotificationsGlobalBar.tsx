import { useEffect, useState } from "react";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";

const NotificationsGlobalBar: React.FC = () => {

    const userCtx = useUserContext();
    const navigate = useNavigate()
    const location = useLocation();

    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [hideSection, setHideSection] = useState(false)

    // TODO if 1 notification - show it on global bar, if more
    // TODO mark as read, delete, etc
    // TODO notifications counter global state
    // TODO notification appear animation

    useEffect(() => {
        setNotifications(userCtx.notifications)
    }, [userCtx.notifications])

    useEffect(() => {
        if (hideSection) {
            if (!location.pathname.includes(Path.NOTIFICATIONS)) {
                setHideSection(false)
            }
        } else {
            if (location.pathname.includes(Path.NOTIFICATIONS)) {
                setHideSection(true)
            }
        }
    }, [location.pathname])

    if (!notifications.length || hideSection) {
        return null;
    }

    return <div className="my-1 mx-2 px-2 py-1 secondary-bg rippple" onClick={() => navigate(Path.NOTIFICATIONS)}>
        <h2 className="text-xl font-bold">{notifications.length} notifications</h2>
    </div>
}

export default NotificationsGlobalBar;