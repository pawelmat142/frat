import { IconType } from "react-icons";
import { FaBan, FaBell, FaBriefcase, FaCalendarAlt, FaCog, FaComments, FaEllipsisV, FaHome, FaIdCard, FaPaperPlane, FaPhone, FaSearch, FaSignInAlt, FaSignOutAlt, FaTags, FaTimes, FaTrash, FaUserCircle, FaUserFriends, FaUserPlus } from "react-icons/fa";

export const Icons: { [key: string]: IconType } = {
    HOME: FaHome,
    MENU: FaEllipsisV,
    FRIENDS: FaUserFriends,
    CHAT: FaComments,
    MSG: FaPaperPlane,
    NOTIFICATION: FaBell,
    ACCOUNT: FaUserCircle,
    SIGN_IN: FaSignInAlt,
    SIGN_OUT: FaSignOutAlt,
    OFFER: FaBriefcase,
    WORKER: FaIdCard,
    DELETE: FaTrash,
    CANCEL: FaTimes,
    PHONE: FaPhone,
    SEARCH: FaSearch,
    ADD_USER: FaUserPlus,
    SETTINGS: FaCog,
    EMPTY: FaBan,
    CATEGORIES: FaTags,
    LANGUAGE: FaTags,
    MARKER: FaTags,
    CALLENDAR: FaCalendarAlt,
} as const