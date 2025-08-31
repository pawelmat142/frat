function AdminPanelPage() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="mb-4">Admin Panel</h2>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <a href="#dashboard" className="active">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#dictionaries">
                Dictionaries
              </a>
            </li>
            <li>
              <a href="#users">
                Users
              </a>
            </li>
            <li>
              <a href="#settings">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="admin-main">
        <div className="container">
          <h1 className="mb-4">Admin Dashboard</h1>
          
          <div className="card mb-4">
            <h2 className="mb-4">System Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="card">
                <h3>Total Users</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>1,234</p>
              </div>
              <div className="card">
                <h3>Active Jobs</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>89</p>
              </div>
              <div className="card">
                <h3>Companies</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>156</p>
              </div>
              <div className="card">
                <h3>Active Sessions</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>45</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="mb-4">Quick Actions</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary">
                Manage Dictionaries
              </button>
              <button className="btn btn-secondary">
                View User Reports
              </button>
              <button className="btn btn-secondary">
                System Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPanelPage;
