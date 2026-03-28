import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { useUserContext } from 'user/UserProvider';
import { useOffersContext } from 'offer/OffersProvider';
import { useWorkerContext } from 'employee/WorkerProvider';
import { AuthService } from 'auth/services/AuthService';
import { useTranslation } from 'react-i18next';
import LangSelectTile from 'global/components/tiles/LangSelectTile';
import ThemeSelectTile from 'global/components/tiles/ThemeSelectTile';
import { Ico } from 'global/icon.def';
import InstallPwaButton from "global/components/InstallPwaButton";
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";

const MainTiles: React.FC = () => {

    const iconSize = 42

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { me } = useUserContext()
    const { offers } = useOffersContext()
    const { worker } = useWorkerContext()
    const workerSearchCtx = useWorkersSearch()
    const offerSearchCtx = useOfferSearch()

    const hasSomeOffers = !!offers?.length


    const navigateToWorkersSearch = () => {
        workerSearchCtx.navToSearch()
    }

    const navigateToOffersSearch = () => {
        offerSearchCtx.navToSearch()
    }

    return (
        <div>
            <div className="main-tiles">

                {!me && (
                    <div className="ripple square-tile col-tile big py-8" onClick={() => navigate(Path.SIGN_IN)}>
                        <Ico.SIGN_IN size={iconSize} />
                        <div>{t("signin.submit")}</div>
                    </div>
                )}
                <div className="ripple square-tile col-tile" onClick={navigateToWorkersSearch}>
                    <Ico.SEARCH size={iconSize} />
                    <div>{t("employeeProfile.search")}</div>
                </div>
                <div className="ripple square-tile col-tile" onClick={navigateToOffersSearch}>
                    <Ico.OFFER size={iconSize} />
                    <div>{t("offer.search")}</div>
                </div>


                <div className="ripple square-tile col-tile big">
                    <InstallPwaButton />
                </div>


                {!!me && (
                    <>
                        {worker ? (
                            <div className="ripple square-tile col-tile" onClick={() => navigate(Path.getWorkerProfilePath(me!.displayName))}>
                                <Ico.WORKER size={iconSize} />
                                <div>{t("profile.tile")}</div>
                            </div>
                        ) : (
                            <div className="ripple square-tile col-tile" onClick={() => navigate(Path.WORKER_FORM)}>
                                <Ico.ADD_USER size={iconSize} />
                                <div>{t("profile.add")}</div>
                            </div>
                        )}

                        {hasSomeOffers ? (
                            <div className="ripple square-tile col-tile" onClick={() => navigate(Path.getOffersPath(me!.uid))}>
                                <Ico.OFFER size={iconSize} />
                                <div>{t("offer.management")}</div>
                            </div>
                        ) : (
                            <div className="ripple square-tile col-tile" onClick={() => navigate(Path.OFFER_FORM)}>
                                <Ico.OFFER size={iconSize} />
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

                {!!me && (<div className="ripple sec-tile-wrapper" onClick={() => navigate(Path.SETTINGS)}>
                    <div className="square-tile">
                        <Ico.SETTINGS size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("common.settings")}</div>
                </div>)}

                <LangSelectTile iconSize={iconSize} />

                <ThemeSelectTile iconSize={iconSize}></ThemeSelectTile>

                {!!me && (<div className="ripple sec-tile-wrapper" onClick={() => AuthService.logout()}>
                    <div className="square-tile">
                        <Ico.SIGN_OUT size={iconSize} />
                    </div>
                    <div className="sec-tile-label">{t("signin.logout")}</div>
                </div>)}

            </div>

        </div>

    );
}

export default MainTiles;