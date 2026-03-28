
import ReportForm from "global/components/ReportForm";
import MainTiles from "./MainTiles";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import DashboardView from "dashboard/DashboardView";
import Logo from "global/components/Logo";
import Header from "global/components/Header";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const authCtx = useAuthContext();

  if (authCtx.loading) {
    return <Loading></Loading>
  }

  if (authCtx.firebaseUser) {
    return <DashboardView></DashboardView>
  }

  return (
    <div className="w-full">

      <div className="header">
        <div className="header-content">
          <div className="header-content-left">
            <Logo></Logo>
            <div className="primary-color xl-font font-bold ml-3">FRAT</div>
          </div>
        </div>
      </div>

      <div className="view-container">
        <MainTiles />

        <ReportForm />
      </div>



    </div>
  );
}

export default HomePage;
