import MainHeaderState from "./header-state/MainHeaderState";
import HeaderBackBtn from "./header-state/HeaderBackBtn";
import { Path } from "../path";

export interface ViewState {
    title?: string;
    leftBtn?: React.ReactNode;
    rightBtn?: React.ReactNode;
    hideFooter?: boolean;
    stickyHeader?: boolean;
}

export const STATES: { [key: string]: ViewState } = {
    [Path.HOME]: {
        leftBtn: <MainHeaderState />,
    },
    [Path.WORKER_FORM]: {
        leftBtn: <HeaderBackBtn />,
        title: 'employeeProfile.form.title',
    },
    [Path.SIGN_IN]: {
        leftBtn: <HeaderBackBtn />,
        title: 'signin.title',
    },
    [Path.TELEGRAM_SIGN]: {
        leftBtn: <HeaderBackBtn />,
        title: 'signin.title',
    },
    [Path.SIGN_UP]: {
        leftBtn: <HeaderBackBtn />,
        title: 'signup.title',
    },
    [Path.FORGOT_PASSWORD]: {
        leftBtn: <HeaderBackBtn />,
        title: 'signin.forgotPasswordTitle',
    },
    [Path.WORKERS_SEARCH]: {
        leftBtn: <HeaderBackBtn />,
        title: 'employeeProfile.searchTitle',
    },
    [Path.WORKERS_FILTERS_SEARCH]: {
        leftBtn: <HeaderBackBtn />,
        title: 'employeeProfile.searchTitle',
    },
    [Path.OFFERS_FILTERS_SEARCH]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.searchTitle',
    },
    [Path.WORKER]: {
        leftBtn: <HeaderBackBtn />,
        title: 'employeeProfile.title',
    },
    [Path.OFFER_FORM]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.form.title',
    },
    [Path.OFFER_FORM_EDIT]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.form.title',
    },
    [Path.OFFERS_SEARCH]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.searchTitle',
    },
    [Path.OFFER]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.offerViewTitle',
    },
    [Path.USER_OFFERS]: {
        leftBtn: <HeaderBackBtn />,
        title: 'offer.offersList',
    },
    [Path.PROFILE]: {
        leftBtn: <HeaderBackBtn />,
        title: 'account.account',
    },
    [Path.ERROR_PAGE]: {

    },
    [Path.CHATS]: {
        leftBtn: <HeaderBackBtn />,
        title: 'FRAT Chat',
    },
    [Path.FRIENDS]: {
        leftBtn: <HeaderBackBtn />,
        title: 'account.friends',
    },
    [Path.NOTIFICATIONS]: {
        leftBtn: <HeaderBackBtn />,
        title: 'notification.header',
    },
    [Path.SETTINGS]: {
        leftBtn: <HeaderBackBtn />,
        title: 'common.settings',
    }
}