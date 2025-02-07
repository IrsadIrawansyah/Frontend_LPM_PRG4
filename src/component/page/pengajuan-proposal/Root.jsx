import { useState } from "react";
import PengajuanProposalIndex from "./Index";
import PengajuanProposalAdd from "./Add";
import PengajuanProposalDetail from "./Detail";
import PengajuanProposalEdit from "./Edit";

export default function PengajuanProposal() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PengajuanProposalIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <PengajuanProposalAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <PengajuanProposalEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <PengajuanProposalDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
