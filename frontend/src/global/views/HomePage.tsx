import Buton from "../components/controls/Buton";
import { BtnModes } from "../interface/controls.interface";
import { TranslationService } from "global/services/Translation.service";

const HomePage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="container">
        <div className="card">
          <h1 className="mb-4">Welcome to JobHigh</h1>
          <p className="mb-4">
            High-Altitude Work Professional Network Platform
          </p>
          <p className="mb-4">
            Connect with rope access technicians, industrial climbers, wind turbine technicians,
            and other height work specialists. Find opportunities, share experiences, and grow your career
            in the high-altitude industry.
          </p>
          <div className="mt-4">
            <button className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Find Work
            </button>
            <button className="btn btn-secondary">
              Join Network
            </button>
          </div>

          <Buton>Elo</Buton>
          <Buton mode={BtnModes.SECONDARY} onClick={ async () => {
            const translation = await TranslationService.getTranslation('pl');
            console.log(translation);
          }}>TEST</Buton>
          <Buton mode={BtnModes.PRIMARY_TXT}>Elo</Buton>
          <Buton mode={BtnModes.SECONDARY_TXT}>Elo</Buton>
          <Buton mode={BtnModes.WARNING}>Elo</Buton>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
