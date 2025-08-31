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
        </div>
      </div>
    </div>
  );
}

export default HomePage;
