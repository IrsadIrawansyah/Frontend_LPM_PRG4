import { useState } from "react";
import MasterInformasiIndex from "./Index";
import MasterInformasiAdd from "./Add";
import MasterInformasiEdit from "./Edit";

export default function MasterInformasi() {
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
        return <MasterInformasiIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterInformasiAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterInformasiEdit
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
