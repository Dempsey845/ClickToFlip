import BuildComponent from "../components/BuildComponent";
import { getUserComponents } from "../handlers/apiHandler";
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

  const displayComponent = (component) => {
    return (
      <div className="container mt-4">
        <BuildComponent
          key={component.id}
          component={component}
          type={component.type}
          useBuild={false}
          onUpdate={onUpdate}
        />
      </div>
    );
  };

  return <div>{components?.map(displayComponent)}</div>;
}

export default UserComponentsPage;
