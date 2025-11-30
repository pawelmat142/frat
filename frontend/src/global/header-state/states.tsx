import MainHeaderState from "./MainHeaderState";
import HeaderBackBtn from "./HeaderBackBtn";
import { Path } from "../../path";

export interface HeaderState {
    title?: string;
    leftBtn?: React.ReactNode;
    rightBtn?: React.ReactNode;
}

export const STATES: { [key: string]: HeaderState } = {
    [Path.HOME]: {
        leftBtn: <MainHeaderState/>,
    },
    [Path.EMPLOYEE_PROFILE_FORM]: {
        leftBtn: <HeaderBackBtn/>,
        title: 'employeeProfile.form.title',
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
    [Path.ERROR_PAGE]: {
        
    }
}