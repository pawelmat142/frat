import MainHeaderState from "./MainHeaderState";
import HeaderBackBtn from "./HeaderBackBtn";
import { Path } from "../../path";

export interface ViewState {
    title?: string;
    leftBtn?: React.ReactNode;
    rightBtn?: React.ReactNode;
    hideFooter?: boolean;
    stickyHeader?: boolean;
}

export const STATES: { [key: string]: ViewState } = {
    [Path.HOME]: {
        leftBtn: <MainHeaderState/>,
    },
    [Path.EMPLOYEE_PROFILE_FORM]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'employeeProfile.form.title',
    },
    [Path.SIGN_IN]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'signin.title',
    },
    [Path.SIGN_UP]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'signup.title',
    },
    [Path.FORGOT_PASSWORD]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'signin.forgotPasswordTitle',
    },
    [Path.EMPLOYEE_SEARCH]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'employeeProfile.searchTitle',
    },
    [Path.EMPLOYEE_PROFILE]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'employeeProfile.title',
    },
    [Path.OFFER_FORM]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'offer.form.title',
    },
    [Path.OFFERS_SEARCH]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'offer.searchTitle',
    },
    [Path.OFFER]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'offer.offerViewTitle',   
    },
    [Path.USER_OFFERS]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'offer.offersList',
    },
    [Path.ACCOUNT]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'account.account',
    },
    [Path.ERROR_PAGE]: {
        
    },
    [Path.CHATS]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'FRAT Chat',
    }
}