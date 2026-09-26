import { useEffect, useState } from "react";
import { fetchPublicDemoSetups } from "../services/demoSetupApi";

function useDemoSetup(activeOnly = true) {
  const [setups, setSetups] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPublicDemoSetups()
      .then((records) => {
        if (active) setSetups(activeOnly ? records.filter((setup) => setup.status === "Active") : records);
      })
      .catch(() => { if (active) setSetups([]); });
    return () => { active = false; };
  }, [activeOnly]);

  return setups;
}

export default useDemoSetup;
