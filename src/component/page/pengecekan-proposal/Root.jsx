import { useState } from "react";
import ProsesPengecekanProposalIndex from "./Index";
import ProsesPengecekanProposalDetail from "./Detail";

export default function PengecekanProposal() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <ProsesPengecekanProposalIndex onChangePage={handleSetPageMode} />
        );
      case "detail":
        return (
          <ProsesPengecekanProposalDetail
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
