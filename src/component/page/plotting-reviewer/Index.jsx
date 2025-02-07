import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Paging from "../../part/Paging";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Judul Proposal": null,
    "Nama Reviewer": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Key2] desc", Text: "-- Semua --" },
  { Value: "[Judul Proposal] asc", Text: "Judul Proposal [↑]" },
  { Value: "[Judul Proposal] desc", Text: "Judul Proposal [↓]" },
  { Value: "[Nama Reviewer] asc", Text: "Nama Reviewer [↑]" },
  { Value: "[Nama Reviewer] desc", Text: "Nama Reviewer [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  { Value: "Menunggu Persetujuan", Text: "Menunggu Persetujuan" },
  { Value: "Diterima Reviewer", Text: "Diterima Reviewer" },
  { Value: "Ditolak Reviewer", Text: "Ditolak Reviewer" },
];

export default function MasterReviewerIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const username = JSON.parse(decryptId(Cookies.get("activeUser"))).username;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Key2] desc",
    status: "",
    role: role,
    username: username,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prev) => ({
      ...prev,
      page: newCurrentPage,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const data = await UseFetch(
          API_LINK + "PlottingReviewer/GetDataPlottingProposalReviewer",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            let aksi;
            if (role === "ROL52") {
              switch (value.Status) {
                case "Draft":
                  aksi = ["Detail", "Edit", "Sent"];
                  value.Status = <strong>{value.Status}</strong>;
                  value.No = <strong>{value.No}</strong>;
                  value["Judul Proposal"] = (
                    <strong>{value["Judul Proposal"]}</strong>
                  );
                  value["Nama Reviewer"] = (
                    <strong>{value["Nama Reviewer"]}</strong>
                  );
                  break;
                case "Diterima Reviewer":
                case "Menunggu Persetujuan":
                  aksi = ["Detail"];
                  break;
                case "Ditolak Reviewer":
                  aksi = ["Detail", "Edit", "Sent"];
                  break;
                default:
                  aksi = [];
                  break;
              }
            } else if (role === "ROL53") {
              aksi = ["Detail"];
            }
            return {
              ...value,
              Aksi: aksi,
              Alignment: ["center", "left", "left", "center", "center"],
            };
          });
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter, reloadKey]);

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
        role: role,
        username: username,
      };
    });
  }

  async function handleSent(id) {
    const result = await SweetAlert(
      "Apakah Anda Yakin?",
      "Proposal Akan Dirikirimkan Ke Reviewer",
      "warning",
      "Kirim Sekarang"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(
        API_LINK + "PlottingReviewer/SentPlottingProposalReviewerDetail",
        {
          idPermintaan: id,
        }
      )
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Sukses",
              "Plotting Reviewer berhasil dikirim",
              "success"
            );
            handleSetCurrentPage(currentFilter.page);
          }
        })
        .then(() => {
          setIsLoading(false);
          setReloadKey((prevKey) => prevKey + 1);
        });
    }
  }

  if (isLoading) return <Loading />;

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data reviewer."
          />
        </div>
      )}
      <div className="flex-fill">
        <div className="input-group mb-3">
          {role === "ROL52" && (
            <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            />
          )}

          <Input
            ref={searchQuery}
            forInput="pencarianReviewer"
            placeholder="Cari"
          />
          <Button
            iconName="search"
            classType="primary px-4"
            title="Cari"
            onClick={handleSearch}
          />
          <Filter>
            <DropDown
              ref={searchFilterSort}
              forInput="ddUrut"
              label="Urut Berdasarkan"
              type="none"
              arrData={dataFilterSort}
              defaultValue="[Key2] desc"
            />
            <DropDown
              ref={searchFilterStatus}
              forInput="ddStatus"
              label="Status"
              type="semua"
              arrData={dataFilterStatus}
              defaultValue=""
            />
          </Filter>
        </div>
      </div>
      <div className="table-responsive">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <Table
              data={currentData}
              onDetail={onChangePage}
              onEdit={onChangePage}
              onSent={handleSent}
              className="text-center"
            />
            <Paging
              pageSize={PAGE_SIZE}
              pageCurrent={currentFilter.page}
              totalData={currentData[0]?.Count || 0}
              navigation={handleSetCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
