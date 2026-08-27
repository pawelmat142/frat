import Loading from "global/components/Loading";
import ListUi from "global/components/ui/ListUi";
import { Ico } from "global/icon.def";
import NotificationsGlobalBar from "notification/components/NotificationsGlobalBar";
import { useUserContext } from "user/UserProvider";
import { EDIT_AVATAR_FLAG_KEY } from "user/components/AvatarTile";
import { BtnModes } from "global/interface/controls.interface";
import UserProfileItem from "user/components/UserProfileItem";
import { useTranslation } from "react-i18next";
import EmailVerificationWarning from "./EmailVerificationWarning";
import RecentViewedWorkers from "./RecentViewedWorkers";
import RecentViewedOffers from "./RecentViewedOffers";
import MyListDashboard from "./MyListDashboard";
import IconButton from "global/components/controls/IconButon";
import { useDrawer } from "global/providers/DrawerProvider";
import MyOffersDashboard from "./MyOffersDashboard";
import LatestOffersDashboard from "./LatestOffersDashboard";
import MostViewedWorkers from "./MostViewedWorkers";
import FriendsDashboard from "./FriendsDashboard";
import { useUserMenuGroups } from "user/menu/useUserMenuGroups";
import AboutDashboard from "./mobile/AboutDashboard";
import { useGlobalContext } from "global/providers/GlobalProvider";
import DesktopDashboard from "./desktop/DesktopDashboard";
import MyWorkerProfileDashboard from "./MyWorkerProfileDashboard";

const DashboardView: React.FC = () => {
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const drawer = useDrawer();
    const { isDesktop } = useGlobalContext();
    const menuGroups = useUserMenuGroups({ onAction: drawer.close });
    const me = userCtx.me;
    const editableAvatar = localStorage.getItem(EDIT_AVATAR_FLAG_KEY) === "true";

    if (userCtx.loading || !me) {
        return <Loading></Loading>;
    }

    if (isDesktop) {
        return <DesktopDashboard />;
    }

    const menu = (
        <IconButton
            icon={<Ico.BURGER />}
            mode={BtnModes.SECONDARY_TXT}
            onClick={() => {
                drawer.open({
                    showClose: true,
                    title: t("common.menu"),
                    children: <ListUi groups={menuGroups} itemClassName="m-font py-1"></ListUi>,
                });
            }}
        ></IconButton>
    );

    return (
        <div className="w-full">
            <NotificationsGlobalBar />

            <UserProfileItem
                user={me}
                topRightComponent={menu}
                editableAvatar={editableAvatar}
                allowNavigate
            ></UserProfileItem>

            <EmailVerificationWarning></EmailVerificationWarning>

            <MyWorkerProfileDashboard />

            <MyListDashboard></MyListDashboard>
            <FriendsDashboard></FriendsDashboard>
            <MyOffersDashboard></MyOffersDashboard>
            <LatestOffersDashboard></LatestOffersDashboard>
            <MostViewedWorkers></MostViewedWorkers>
            <RecentViewedOffers></RecentViewedOffers>
            <RecentViewedWorkers></RecentViewedWorkers>
            <AboutDashboard />
        </div>
    );
};

export default DashboardView;