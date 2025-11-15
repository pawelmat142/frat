
import ReportForm from "global/components/ReportForm";
import MainTiles from "./MainTiles";
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="view-container">
      
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
