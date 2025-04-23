import BuildComponent from "./BuildComponent";
import { getUserComponents } from "../handlers/apiHandler";
import { useState, useEffect } from "react";

function UserComponents({ onUpdate }) {
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
      <BuildComponent
        key={component.id}
        component={component}
        type={component.type}
        useBuild={false}
        onUpdate={onUpdate}
      />
    );
  };

  return <div>{components?.map(displayComponent)}</div>;
}

export default UserComponents;
