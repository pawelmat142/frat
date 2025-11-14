import { FaSearch, FaBriefcase, FaUserPlus, FaUser, FaPlus, FaCog, FaLanguage, FaMoon, FaSun, FaListUl, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { toast } from 'react-toastify';
import { useUserContext } from 'user/UserProvider';
import { useAuthContext } from 'auth/AuthProvider';
import { AuthService } from 'auth/services/AuthService';
import { useTheme } from "../providers/ThemeProvider";
import { SelectorItem } from '../interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { useTranslation } from 'react-i18next';
import LangSelectTile from 'global/components/tiles/LangSelectTile';
import ThemeSelectTile from 'global/components/tiles/ThemeSelectTile';

const MainTiles: React.FC = () => {

    const iconSize = 42

    {/* todo translations */ }

    // TODO desktop version 
    // TODO zamykanie bottom sheeta nawigacja

    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useAuthContext()
    const { employeeProfile } = useUserContext();

    return (
        <div>
            <div className="main-tiles">

                {!me && (
                    <div className="square-tile col-tile big" onClick={() => navigate(Path.SIGN_IN)}>
                        <FaSignInAlt size={iconSize} />
                        <div>Zaloguj się</div>
                    </div>
                )}
                <div className="square-tile col-tile" onClick={() => navigate(Path.EMPLOYEE_SEARCH)}>
                    <FaSearch size={iconSize} />
                    <div>Szukaj pracowników</div>
                </div>
                <div className="square-tile col-tile" onClick={() => {
                    toast.info("Funkcja w budowie");
                }}>
                    <FaBriefcase size={iconSize} />
                    <div>Przeglądaj oferty</div>
                </div>


                {!!me && (
                    <>
                        {employeeProfile ? (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.getEmployeeProfilePath(me!.displayName))}>
                                <FaUser size={iconSize} />
                                <div>Twój profil</div>
                            </div>
                        ) : (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.EMPLOYEE_PROFILE_FORM)}>
                                <FaUserPlus size={iconSize} />
                                <div>Dodaj profil</div>
                            </div>
                        )}
                        {/* TODO add job offer view */}
                        <div className="square-tile col-tile">
                            <FaPlus size={iconSize} />
                            <div>Dodaj ofertę</div>
                        </div>
                    </>

                )}
            </div>


            <div className='sec-tiles'>
                {!!me && (<div className="sec-tile-wrapper">
                    <div className="square-tile">
                        <FaCog size={iconSize} />
                    </div>
                    <div className="sec-tile-label">Ustawienia</div>
                    {/* TODO settings view */}
                </div>)}

                <LangSelectTile iconSize={iconSize} />

                <ThemeSelectTile iconSize={iconSize}></ThemeSelectTile>

                {!!me && (<div className="sec-tile-wrapper" onClick={() => AuthService.logout()}>
                    <div className="square-tile">
                        <FaSignOutAlt size={iconSize} />
                    </div>
                    <div className="sec-tile-label">Wyloguj</div>
                </div>)}

            </div>

        </div>

    );
}

export default MainTiles;