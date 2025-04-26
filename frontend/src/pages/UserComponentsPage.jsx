import BuildComponent from "../components/BuildComponent";
import { getUserComponents, deleteUserComponent } from "../handlers/apiHandler";
import { useState, useEffect } from "react";

function UserComponentsPage({ onUpdate }) {
  const [components, setComponents] = useState(null);

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
      />
    );
  };

  return (
    <div className="container mt-4">
      {components?.map((component, index) => {
        return displayComponent(component, index);
      })}
    </div>
  );
}

export default UserComponentsPage;
