// Root.jsx
import { useState } from "react";
import MasterBobotIndex from "./Index";
import MasterBobotAdd from "./Add";
import MasterBobotEdit from "./Edit";

export default function MasterBobot() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterBobotIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterBobotAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterBobotEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
    }
  }

  return <div>{getPageMode()}</div>;
}
