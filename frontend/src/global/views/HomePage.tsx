
import LangSelector from "global/components/controls/LangSelector";
import ReportForm from "global/components/ReportForm";
import { httpClient } from "global/services/http";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path"
import { useTranslation } from "react-i18next";
import MainTiles from "./MainTiles";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="page-container w-full">
      <div className="container w-full">
        <div className="card w-full">


          <MainTiles />
          {/* <h1 className="mb-4">Welcome to JobHigh</h1>


          <p className="mb-4">
            High-Altitude Work Professional Network Platform
          </p>
          <p className="mb-4">
            Connect with rope access technicians, industrial climbers, wind turbine technicians,
            and other height work specialists. Find opportunities, share experiences, and grow your career
            in the high-altitude industry.
          </p>

          <div className="flex my-5">
            <Button onClick={async () => {
              await httpClient.get('/test-sww');
            }}>Test Sww</Button>

            <Button onClick={() => {
              navigate(Path.EMPLOYEE_SEARCH);
            }}>{t("employeeProfile.search.label")}</Button>
          </div> */
          
          }



          <LangSelector />
        </div>
        <ReportForm />
      </div>
    </div>
  );
}

export default HomePage;
