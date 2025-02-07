import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import { formatDate } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";
import fetchData from "../../util/UseFetch";
// Fungsi untuk format rupiah dengan titik pemisah ribuan dan simbol Rp.
const formatRupiah = (angka) => {
  return `Rp. ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(angka)}`;
};

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "No. Proposal": null,
    "Judul Proposal": null,
    "Skema Pengabdian": null,
    "Ketua": null,
    "Total Dana": null,
    "Tanggal Kirim": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[No. Proposal] asc", Text: "Nomor Proposal [↑]" },
  { Value: "[No. Proposal] desc", Text: "Nomor Proposal [↓]" },
  { Value: "[Judul Proposal] asc", Text: "Judul Proposal [↑]" },
  { Value: "[Judul Proposal] desc", Text: "Judul Proposal [↓]" },
  { Value: "[Tanggal Kirim] asc", Text: "Tanggal Kirim [↑]" },
  { Value: "[Tanggal Kirim] desc", Text: "Tanggal Kirim [↓]" },
];

const dataFilterStatus = [
  { Value: "Draft", Text: "Draft" },
  { Value: "Menunggu Konfirmasi", Text: "Menunggu Konfirmasi" },
  { Value: "Diajukan", Text: "Diajukan ke Admin" },
  { Value: "Diterima oleh Admin", Text: "Diterima oleh Admin" },
  { Value: "Proses Penilaian", Text: "Proses Penilaian" },
  { Value: "Direvisi Reviewer", Text: "Direvisi Oleh Reviewer" },
  { Value: "Pengecekan Revisi", Text: "Pengecekan Revisi" },
];

export default function PengajuanProposalIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const username = JSON.parse(decryptId(Cookies.get("activeUser"))).username;
  const [reloadKey, setReloadKey] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal Kirim] desc",
    status: "",
    role: role,
    username: username,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  async function handleSent(id, status) {
    const result = await SweetAlert(
      "Anda Yakin  Ingin Kirim Proposal?",
      "Begitu Anda kirim, Nomor Proposal Bakal Langsung Dibuat, Dan Data Ini Nggak Bisa Diubah Lagi",
      "warning",
      "Kirim Sekarang!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      if (status === "Direvisi Reviewer") {
        UseFetch(
          API_LINK + "PengajuanProposal/GetSentPengajuanProposalRevisi",
          {
            idPermintaan: id,
          }
        )
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Data Revisi Proposal berhasil dikirim",
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => {
            setIsLoading(false);
            setReloadKey((prevKey) => prevKey + 1); // Tambahkan reloadKey
          });
      } else {
        console.log(currentData.Status);
        console.log("jalan", currentData);
        UseFetch(API_LINK + "PengajuanProposal/GetSentPengajuanProposal", {
          idPermintaan: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Data Pengajuan Proposal berhasil dikirim",
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => {
            setIsLoading(false);
            setReloadKey((prevKey) => prevKey + 1); // Tambahkan reloadKey
          });
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "PengajuanProposal/GetDataPengajuanProposal",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          // Filter data untuk mengabaikan Status === "Draft" dan Ketua bukan currentFilter.username
          const filteredData = data.filter(
            (value) =>
              value &&
              value["Status"] !== undefined &&
              value["Ketua"] !== undefined &&
              !(
                value["Status"] === "Draft" &&
                value["Ketua"] !== currentFilter.username
              )
          );
          // Jika filteredData kosong, atur ke default atau beri tanda
          if (filteredData.length === 0) {
            setCurrentData(inisialisasiData);
            return; // Keluar dari fungsi jika data kosong
          }

          const formattedData = filteredData.map((value) => {
            let aksi = [];
            if (
              (value["Status"] === "Draft" ||
                value["Status"] === "Direvisi Reviewer") &&
              value["Ketua"] === currentFilter.username
            ) {
              aksi = ["Detail", "Edit", "Sent"];
            } else if (value["Status"] === "Menunggu Konfirmasi") {
              aksi = ["Detail"];
            } else {
              aksi = [
                role === "ROL17" &&
                ![
                  "Draft",
                  "Batal",
                  "Sudah Dibuat SPK",
                  "Dalam Proses Produksi",
                  "Selesai",
                ].includes(value["Status"])
                  ? "Cancel"
                  : "",
                "Detail",
                ["Draft"].includes(value["Status"]) ||
                ((role === "ROL50" || role === "ROL18") &&
                  ["Menunggu Analisa"].includes(value["Status"]))
                  ? "Edit"
                  : "",
                ["Draft"].includes(value["Status"]) ? "Sent" : "",
              ];
            }

            return {
              ...value,
              "Total Dana": formatRupiah(value["Total Dana"]), // Format Total Dana dengan Rp.
              Aksi: aksi,
              Alignment: [
                "center",
                "center",
                "left",
                "left",
                "left",
                "center",
                "center",
                "center",
              ],
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

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            {role === "ROL01" && (
              <Button
                iconName="add"
                classType="success"
                label="Tambah"
                onClick={() => onChangePage("add")}
              />
            )}
            <Input
              ref={searchQuery}
              forInput="pencarianPermintaanPelanggan"
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
                defaultValue="[Tanggal Kirim] desc"
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
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onDetail={onChangePage}
                onEdit={onChangePage}
                onSent={handleSent}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
