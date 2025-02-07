import { useState } from "react";
import ReviewProposalIndex from "./Index";
import ReviewProposalDetail from "./Detail";

export default function PlottingReviewer() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <ReviewProposalIndex onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <ReviewProposalDetail
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
