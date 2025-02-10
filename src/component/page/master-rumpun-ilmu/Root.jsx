import { useState } from "react";
import MasterRumpunIlmuIndex from "./Index";
import MasterRumpunIlmuAdd from "./Add";
import MasterRumpunIlmuEdit from "./Edit";

export default function MasterRumpunIlmu() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function handleSetPageMode(mode, withID = null) {
    if (withID) {
      setDataID(withID);
    }
    setPageMode(mode);
  }

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterRumpunIlmuIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterRumpunIlmuAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterRumpunIlmuEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "delete":
        return (
          <MasterRumpunIlmuDelete
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  return <div>{getPageMode()}</div>;
}
