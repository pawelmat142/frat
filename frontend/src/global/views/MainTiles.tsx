import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { useUserContext } from 'user/UserProvider';
import { useAuthContext } from 'auth/AuthProvider';
import { AuthService } from 'auth/services/AuthService';
import { useTranslation } from 'react-i18next';
import LangSelectTile from 'global/components/tiles/LangSelectTile';
import ThemeSelectTile from 'global/components/tiles/ThemeSelectTile';
import { Icons } from 'global/icon.def';

const MainTiles: React.FC = () => {

    const iconSize = 42

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { me } = useAuthContext()
    const { worker: employeeProfile, offers } = useUserContext()

    const hasSomeOffers = !!offers?.length

    return (
        <div>
            <div className="main-tiles">

                {!me && (
                    <div className="square-tile col-tile big py-8" onClick={() => navigate(Path.SIGN_IN)}>
                        <Icons.SIGN_IN size={iconSize} />
                        <div>{t("signin.submit")}</div>
                    </div>
                )}
                <div className="square-tile col-tile" onClick={() => navigate(Path.WORKERS_FILTERS_SEARCH)}>
                    <Icons.SEARCH size={iconSize} />
                    <div>{t("employeeProfile.search")}</div>
                </div>
                <div className="square-tile col-tile" onClick={() => navigate(Path.OFFERS_SEARCH)}>
                    <Icons.OFFER size={iconSize} />
                    <div>{t("offer.search")}</div>
                </div>

                {!!me && (
                    <>
                        {employeeProfile ? (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.getWorkerProfilePath(me!.displayName))}>
                                <Icons.WORKER size={iconSize} />
                                <div>{t("profile.tile")}</div>
                            </div>
                        ) : (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.WORKER_FORM)}>
                                <Icons.ADD_USER size={iconSize} />
                                <div>{t("profile.add")}</div>
                            </div>
                        )}

                        {hasSomeOffers ? (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.getOffersPath(me!.uid))}>
                                <Icons.OFFER size={iconSize} />
                                <div>{t("offer.management")}</div>
                            </div>
                        ) : (
                            <div className="square-tile col-tile" onClick={() => navigate(Path.OFFER_FORM)}>
                                <Icons.OFFER size={iconSize} />
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
                        <Icons.SETTINGS size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("common.settings")}</div>
                    {/* TODO settings view */}
                </div>)}

                <LangSelectTile iconSize={iconSize} />

                <ThemeSelectTile iconSize={iconSize}></ThemeSelectTile>

                {!!me && (<div className="sec-tile-wrapper" onClick={() => AuthService.logout()}>
                    <div className="square-tile">
                        <Icons.SIGN_OUT size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("signin.logout")}</div>
                </div>)}

            </div>

        </div>

    );
}

export default MainTiles;