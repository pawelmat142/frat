import { IconType } from "react-icons";
import { FaBan, FaBell, FaBriefcase, FaCalendarAlt, FaCheck, FaCog, FaComments, FaEdit, FaEllipsisV, FaGlobe, FaHome, FaIdCard, FaPaperPlane, FaPhone, FaSearch, FaSignInAlt, FaSignOutAlt, FaTags, FaTimes, FaTrash, FaUserCircle, FaUserFriends, FaUserPlus } from "react-icons/fa";

export const Ico = {
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
    LANGUAGE: FaGlobe,
    MARKER: FaTags,
    CALENDAR: FaCalendarAlt,
    EDIT: FaEdit,
    CHECK: FaCheck,
} as const satisfies Record<string, IconType>