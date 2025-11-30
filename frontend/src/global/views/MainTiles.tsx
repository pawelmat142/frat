import { FaSearch, FaBriefcase, FaUserPlus, FaUser, FaPlus, FaCog, FaSignInAlt, FaSignOutAlt, FaTasks } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { toast } from 'react-toastify';
import { useUserContext } from 'user/UserProvider';
import { useAuthContext } from 'auth/AuthProvider';
import { AuthService } from 'auth/services/AuthService';
import { useTranslation } from 'react-i18next';
import LangSelectTile from 'global/components/tiles/LangSelectTile';
import ThemeSelectTile from 'global/components/tiles/ThemeSelectTile';

const MainTiles: React.FC = () => {

    const iconSize = 42

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { me } = useAuthContext()
    const { employeeProfile, offers } = useUserContext()

    const hasSomeOffers = !!offers?.length

    return (
        <div>
            <div className="main-tiles">

                {!me && (
                    <div className="square-tile col-tile big py-8" onClick={() => navigate(Path.SIGN_IN)}>
                        <FaSignInAlt size={iconSize} />
                        <div>{t("signin.submit")}</div>
                    </div>
                )}
                <div className="square-tile col-tile" onClick={() => navigate(Path.EMPLOYEE_SEARCH)}>
                    <FaSearch size={iconSize} />
                    <div>{t("employeeProfile.search")}</div>
                </div>
                <div className="square-tile col-tile" onClick={() => navigate(Path.OFFERS_SEARCH)}>
                    <FaBriefcase size={iconSize} />
                    <div>{t("offer.search")}</div>
                </div>

                {!!me && (
                    <>
                        {employeeProfile ? (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.getEmployeeProfilePath(me!.displayName))}>
                                <FaUser size={iconSize} />
                                <div>{t("profile.tile")}</div>
                            </div>
                        ) : (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.EMPLOYEE_PROFILE_FORM)}>
                                <FaUserPlus size={iconSize} />
                                <div>{t("profile.add")}</div>
                            </div>
                        )}

                        {hasSomeOffers ? (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.getOffersPath(me!.uid))}>
                                <FaTasks size={iconSize} />
                                <div>{t("offer.management")}</div>
                            </div>
                        ) : (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.OFFER_FORM)}>
                                <FaPlus size={iconSize} />
                                <div>{t("offer.add")}</div>
                            </div>
                        )}
                    </>

                )}
            </div>


            <div className='sec-tiles mb-20'>
                {/* offset */}
                <div className='desktop-flex'></div>
                {!me && (<div className=''></div>)}

                {!!me && (<div className="sec-tile-wrapper">
                    <div className="square-tile">
                        <FaCog size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("common.settings")}</div>
                    {/* TODO settings view */}
                </div>)}

                <LangSelectTile iconSize={iconSize} />

                <ThemeSelectTile iconSize={iconSize}></ThemeSelectTile>

                {!!me && (<div className="sec-tile-wrapper" onClick={() => AuthService.logout()}>
                    <div className="square-tile">
                        <FaSignOutAlt size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("signin.logout")}</div>
                </div>)}

            </div>

        </div>

    );
}

export default MainTiles;