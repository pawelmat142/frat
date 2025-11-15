
import ReportForm from "global/components/ReportForm";
import MainTiles from "./MainTiles";

const HomePage: React.FC = () => {
  return (
    <div className="view-container">
      
      <div className="desktop-flex flex-col items-center mb-20 mt-20  w-full">
        <h1 className="xxxl-font mb-5">Welcome to FRAT</h1>
        <h2 className="l-font">Search platform for high altitude professional workers</h2>
      </div>

      <MainTiles />

{/* TODO style & rwd */}
      <ReportForm />

    </div>
  );
}

export default HomePage;
