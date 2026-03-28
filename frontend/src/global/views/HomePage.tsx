
import ReportForm from "global/components/ReportForm";
import MainTiles from "./MainTiles";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import DashboardView from "dashboard/DashboardView";
import Logo from "global/components/Logo";

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
    <div className="view-container">

      <div className="flex justify-center pb-2 items-center gap-2">
        <Logo></Logo>
        <div className="primary-color xl-font font-bold">FRAT</div>
      </div>
      <div className="flex justify-center pb-10">Find High Altiture Technican</div>

      <div className="desktop-flex flex-col items-center mb-20 mt-20  w-full">
        <h1 className="xxxl-font mb-5">{t('common.h1')}</h1>
        <h2 className="l-font">{t('common.h2')}</h2>
      </div>

      <MainTiles />

      <ReportForm />

    </div>
  );
}

export default HomePage;
