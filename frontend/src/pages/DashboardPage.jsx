import AddBuildForm from "../components/AddBuildForm";
import Builds from "../components/Builds";

function DashboardPage({ onLogout }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <AddBuildForm />
      <Builds />
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default DashboardPage;
