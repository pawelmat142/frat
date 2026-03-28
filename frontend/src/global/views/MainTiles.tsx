import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { useTranslation } from 'react-i18next';
import LangSelectTile from 'global/components/tiles/LangSelectTile';
import ThemeSelectTile from 'global/components/tiles/ThemeSelectTile';
import { Ico } from 'global/icon.def';
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";
import { usePwaInstall } from "global/hooks/usePwaInstall";

const MainTiles: React.FC = () => {

    const iconSize = 42

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { install } = usePwaInstall();

    const workerSearchCtx = useWorkersSearch()
    const offerSearchCtx = useOfferSearch()

    return (
        <div>
            <div className="main-tiles">

                <div className="ripple square-tile col-tile bottom-bar-shadow" onClick={() => navigate(Path.SIGN_IN)}>
                    <Ico.SIGN_IN size={iconSize} />
                    <div >{t("signin.submit")}</div>
                </div>

                <div className="ripple square-tile col-tile bottom-bar-shadow" onClick={install}>
                    <Ico.DOWNLOAD size={iconSize} />
                    <div className="px-5">{t("pwa.install")}</div>
                </div>

                <div className="ripple square-tile col-tile bottom-bar-shadow" onClick={workerSearchCtx.navToSearch}>
                    <Ico.SEARCH size={iconSize} />
                    <div>{t("employeeProfile.search")}</div>
                </div>
                <div className="ripple square-tile col-tile bottom-bar-shadow" onClick={offerSearchCtx.navToSearch}>
                    <Ico.OFFER size={iconSize} />
                    <div>{t("offer.search")}</div>
                </div>
            </div>


            <div className='sec-tiles mb-20'>
                {/* offset */}
                <div className='desktop-flex'></div>
                <div className=''></div>

                <LangSelectTile iconSize={iconSize} />

                <ThemeSelectTile iconSize={iconSize}></ThemeSelectTile>

            </div>

        </div>

    );
}

export default MainTiles;