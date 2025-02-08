import { useState } from "react";
import MasterSkemaPengabdianIndex from "./Index";
import MasterSkemaPengabdianAdd from "./Add";
import MasterSkemaPengabdianEdit from "./Edit";

export default function MasterSkemaPengabdian() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState(null);

  function handleSetPageMode(mode, withID = null) {
    if (withID) {
      setDataID(withID);
    } else {
      setDataID(null);
    }
    setPageMode(mode);
  }

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterSkemaPengabdianIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterSkemaPengabdianAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterSkemaPengabdianEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      default:
        return (
          <div className="alert alert-danger">Halaman tidak ditemukan</div>
        );
    }
  }

  return <div className="container-fluid">{getPageMode()}</div>;
}
