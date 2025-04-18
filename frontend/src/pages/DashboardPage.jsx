const DashboardPage = ({ onLogout }) => (
  <div>
    <h1>Dashboard</h1>
    <button onClick={onLogout}>Logout</button>
  </div>
);

export default DashboardPage;
