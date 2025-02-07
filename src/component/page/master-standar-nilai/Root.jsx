import { useState } from "react";
import MasterStandarNilaiIndex from "./Index";
import MasterStandarNilaiAdd from "./Add";

export default function MasterStandarNilai() {
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
        return <MasterStandarNilaiIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterStandarNilaiAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return;
      default:
        return (
          <div className="alert alert-danger">Halaman tidak ditemukan</div>
        );
    }
  }

  return <div className="container-fluid">{getPageMode()}</div>;
}
