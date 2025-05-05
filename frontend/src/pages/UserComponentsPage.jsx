import BuildComponent from "../components/BuildComponent";
import AddUserComponentModel from "../components/AddUserComponentModel";
import { getUserComponents, deleteUserComponent } from "../handlers/apiHandler";
import { useState, useEffect } from "react";

function UserComponentsPage({ onUpdate, darkMode }) {
  const [components, setComponents] = useState(null);
  const [showAddModel, setShowAddModel] = useState(false);
  const [addType, setAddType] = useState("CPU");

  useEffect(() => {
    const fetchComponents = async () => {
      const comps = await getUserComponents();
      setComponents(comps);
    };

    fetchComponents();
  }, []);

  const handleDeleteUserComponent = async (componentId) => {
    await deleteUserComponent(componentId);
  };

  const displayComponent = (component, index) => {
    return (
      <BuildComponent
        key={`${component.id}:${index}`}
        component={component}
        type={component.type}
        useBuild={false}
        onUpdate={onUpdate}
        userComponent={true}
        onUserComponentDelete={handleDeleteUserComponent}
        darkMode={darkMode}
      />
    );
  };

  return (
    <div className="user-components">
      {showAddModel && (
        <AddUserComponentModel
          type={addType}
          setShowAddComponentModal={setShowAddModel}
          onClose={() => {
            setShowAddModel(false);
          }}
          onComponentAddedWithData={(data) => {
            setShowAddModel(false);
            setComponents((prev) => {
              const newComponents = [...prev, data];
              return newComponents;
            });
          }}
          onUpdate={onUpdate}
          addingCustom={true}
          darkMode={darkMode}
        />
      )}
      <div className="container mt-4">
        {/* Create Custom Component Card */}
        <div
          className={`card mb-4 shadow-sm ${
            darkMode ? "bg-dark text-light border-light" : ""
          }`}
        >
          <div className="card-body text-center">
            <h5 className="card-title">Create a Custom Component</h5>
            <p className="card-text">
              Design and add your own component to use in builds!
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => {
                  setAddType("CPU");
                  setShowAddModel(true);
                }}
              >
                <i className="bi bi-cpu"></i> Create New CPU
              </button>

              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={() => {
                  setAddType("GPU");
                  setShowAddModel(true);
                }}
              >
                <i className="bi bi-gpu-card"></i> Create New GPU
              </button>

              <button
                className="btn btn-warning d-flex align-items-center gap-2"
                onClick={() => {
                  setAddType("Motherboard");
                  setShowAddModel(true);
                }}
              >
                <i className="bi bi-motherboard"></i> Create New Motherboard
              </button>
            </div>
          </div>
        </div>

        {/* User Components List */}
        <div className="row">
          {components?.map((component, index) => (
            <div key={component.id} className="col-md-6 col-lg-4 mb-4">
              {displayComponent(component, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserComponentsPage;
