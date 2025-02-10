import { useState } from "react";
import MasterReviewerIndex from "./Index";
import MasterReviewerAdd from "./Add";

export default function MasterReviewer() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterReviewerIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterReviewerAdd onChangePage={handleSetPageMode} />;
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
