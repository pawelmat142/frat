import MainTiles from "./MainTiles";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import DashboardView from "dashboard/DashboardView";
import Logo from "../components/Logo";
import AboutIntroSection from "./about/AboutIntroSection";
import Button from "global/components/controls/Button";
import { t } from "global/i18n";
import { Ico } from "global/icon.def";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path";

const HomePage: React.FC = () => {
  const authCtx = useAuthContext();
  const navigate = useNavigate();

  if (authCtx.loading) {
    return <Loading></Loading>;
  }

  if (authCtx.firebaseUser) {
    return <DashboardView></DashboardView>;
  }

  return (
    <div className="w-full">
      <div className="header">
        <div className="header-content">
          <div className="header-content-left">
            <Logo></Logo>
            <div className="primary-color xl-font font-bold">FRAT</div>
          </div>
        </div>
      </div>

      <div className="view-container">
        <div className="p-4 md:mt-10">
          <AboutIntroSection showLogo={false}></AboutIntroSection>
          <Button
            className="ml-auto pb-5 pt-2"
            mode={BtnModes.PRIMARY_TXT}
            size={BtnSizes.SMALL}
            onClick={() => navigate(Path.ABOUT)}
          >
            {t("common.readMore")}
            <Ico.CHEVRON_RIGHT />
          </Button>
        </div>
        <div className="mx-3">
          <MainTiles />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
