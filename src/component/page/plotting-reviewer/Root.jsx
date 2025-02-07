import { useState } from "react";
import PlottingReviewerIndex from "./Index";
import PlottingReviewerAdd from "./Add";
import PlottingReviewerDetail from "./Detail";
import PlottingReviewerEdit from "./Edit";

export default function PlottingReviewer() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PlottingReviewerIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <PlottingReviewerAdd onChangePage={handleSetPageMode} />;
      case "edit":
        return (
          <PlottingReviewerEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <PlottingReviewerDetail
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
