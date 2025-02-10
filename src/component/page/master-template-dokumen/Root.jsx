import { useState } from "react";
import MasterTemplateDokumenIndex from "./Index";
import MasterTemplateDokumenAdd from "./Add";
import MasterTemplateDokumenEdit from "./Edit";

export default function MasterTemplateDokumen() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterTemplateDokumenIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterTemplateDokumenAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <MasterTemplateDokumenEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
