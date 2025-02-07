import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
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
import * as XLSX from "xlsx";

// Fungsi untuk format rupiah dengan titik pemisah ribuan dan simbol Rp.
const formatRupiah = (angka) => {
  return `Rp. ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(angka)}`;
};

const inisialisasiData = [
  {
    Key: null,
    Key2: null,
    No: null,
    "No. Proposal": null,
    "Judul Proposal": null,
    "Skema Pengabdian": null,
    "Ketua Pengusul": null,
    "Total Dana": null,
    "Tanggal Kirim": null,
    Tahun: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Tanggal Kirim] desc", Text: "Tanggal Kirim [↓]" },
  { Value: "[Tanggal Kirim] asc", Text: "Tanggal Kirim [↑]" },
  { Value: "[No. Proposal] asc", Text: "Nomor Proposal [↑]" },
  { Value: "[No. Proposal] desc", Text: "Nomor Proposal [↓]" },
  { Value: "[Judul Proposal] asc", Text: "Judul Proposal [↑]" },
  { Value: "[Judul Proposal] desc", Text: "Judul Proposal [↓]" },
];

const dataFilterStatus = [
  { Value: "", Text: "Semua Status" },
  { Value: "Menunggu Konfirmasi", Text: "Menunggu Konfirmasi" },
  { Value: "Diajukan", Text: "Diajukan ke Admin" },
  { Value: "Diterima Admin", Text: "Diterima oleh Admin" },
  { Value: "Proses Penilaian", Text: "Proses Penilaian" },
  { Value: "Direvisi Reviewer", Text: "Direvisi oleh Reviewer" },
];

export default function ProsesPengecekanProposalIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const username = JSON.parse(decryptId(Cookies.get("activeUser"))).username;
  const [reloadKey, setReloadKey] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [dataFilterTahun, setDataFilterTahun] = useState([]);

  useEffect(() => {
    const startYear = 2024;
    const yearOptions = [
      ...Array.from({ length: 6 }, (_, i) => ({
        Value: `${startYear + i}`,
        Text: `${startYear + i}`,
      })),
    ];
    setDataFilterTahun(yearOptions);
  }, []);

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal Kirim] desc",
    status: "",
    tahun: "",
    role: role,
    username: username,
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const searchFilterTahun = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value || "",
      sort: searchFilterSort.current.value || "[Tanggal Kirim] desc",
      status: searchFilterStatus.current.value || "",
      tahun: searchFilterTahun.current.value || "",
    }));
  }

  function handleReset() {
    // Reset all filter inputs and current filter state
    if (searchQuery.current) searchQuery.current.value = "";
    if (searchFilterSort.current)
      searchFilterSort.current.value = "[Tanggal Kirim] desc";
    if (searchFilterStatus.current) searchFilterStatus.current.value = "";
    if (searchFilterTahun.current) searchFilterTahun.current.value = "";

    setCurrentFilter({
      page: 1,
      query: "",
      sort: "[Tanggal Kirim] desc",
      status: "",
      tahun: "",
      role: role,
      username: username,
    });
  }

  const handleCetak = async () => {
    const originalFilter = { ...currentFilter };
    const allDetailedData = [];
    let baseNumber = 0;

    try {
      // Fetch initial data to get the total number of pages
      const initialData = await UseFetch(
        API_LINK + "PengecekanProposal/GetDataPengecekanProposal",
        {
          ...originalFilter,
          page: 1,
          role: role,
          username: username,
        }
      );

      if (initialData === "ERROR" || initialData.length === 0) {
        SweetAlert("Peringatan", "Tidak ada data yang bisa dicetak", "warning");
        return;
      }

      // Determine total pages
      const totalPages = Math.ceil(initialData[0].Count / PAGE_SIZE);
      const allPageData = [];

      // Collect all data across all pages
      for (let page = 1; page <= totalPages; page++) {
        const pageData = await UseFetch(
          API_LINK + "PengecekanProposal/GetDataPengecekanProposal",
          {
            ...originalFilter,
            page: page,
            role: role,
            username: username,
          }
        );

        if (pageData && pageData !== "ERROR" && pageData.length > 0) {
          allPageData.push(...pageData);
        }
      }

      // Process and format all data
      const formattedData = allPageData.map((value) => {
        baseNumber++;
        return {
          No: baseNumber,
          "No. Proposal": value["No. Proposal"] || "-",
          "Judul Proposal": value["Judul Proposal"] || "-",
          "Skema Pengabdian": value["Skema Pengabdian"] || "-",
          "Ketua Pengusul": value["Ketua Pengusul"] || "-",
          "Total Dana": formatRupiah(value["Total Dana"]) || "-",
          "Tanggal Kirim": value["Tanggal Kirim"] || "-",
          Tahun: value["Tahun"] || "-",
          Status: value["Status"] || "-",
        };
      });

      // Prepare and download Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Adjust column widths
      const cols = [
        { wch: 5 },
        { wch: 20 }, // No. Proposal
        { wch: 50 }, // Judul Proposal
        { wch: 30 }, // Skema Pengabdian
        { wch: 30 }, // Ketua Pengusul
        { wch: 20 }, // Total Dana
        { wch: 20 }, // Tanggal Kirim
        { wch: 10 }, // Tahun
        { wch: 20 }, // Status
      ];
      worksheet["!cols"] = cols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Proposal");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Proposal_${originalFilter.tahun || "Semua"}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in handleCetak:", error);
      SweetAlert("Kesalahan", "Terjadi kesalahan saat mencetak data!", "error");
    }
  };

  async function handleSent(id) {
    const result = await SweetAlert(
      "Anda Yakin?",
      "Jika Anda kirim sekarang, proposal ini tidak bisa diubah lagi. Jadi pastikan semua sudah sesuai",
      "warning",
      "Ya, Kirim!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      UseFetch(API_LINK + "PengecekanProposal/KonfirmasiPengecekanProposal", {
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
          setReloadKey((prevKey) => prevKey + 1);
        });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "PengecekanProposal/GetDataPengecekanProposal",
          {
            ...currentFilter,
            page: currentFilter.page,
            query: currentFilter.query,
            sort: currentFilter.sort,
            status: currentFilter.status,
            tahun: currentFilter.tahun,
            role: role,
            username: username,
          }
        );

        if (data === "ERROR") {
          setIsError(true);
          setCurrentData(inisialisasiData);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            let aksi = [];
            if (
              (value["Status"] === "Diajukan" ||
                value["Status"] === "Pengecekan Revisi") &&
              (value["Key2"] === "Diterima Admin" ||
                value["Key2"] === "Ditolak Admin" ||
                value["Key2"] === "Revisi diterima Admin" ||
                value["Key2"] === "Revisi ditolak Admin")
            ) {
              aksi = ["Detail", "Sent"];
            } else {
              aksi = ["Detail"];
            }

            return {
              ...value,
              "Total Dana": formatRupiah(value["Total Dana"]),
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
        setCurrentData(inisialisasiData);
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
            <Button
              iconName="print"
              classType="danger"
              label="Cetak"
              onClick={handleCetak}
            />
            <Input
              ref={searchQuery}
              forInput="pencarianProposal"
              placeholder="Cari Proposal"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            {/* <Button
              iconName="refresh"
              classType="primary px-4"
              title="Reset Filter"
              onClick={handleReset}
            /> */}
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="semua"
                arrData={dataFilterSort}
                defaultValue=""
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="semua"
                arrData={dataFilterStatus}
                defaultValue=""
              />
              <DropDown
                ref={searchFilterTahun}
                forInput="ddTahun"
                label="Tahun"
                type="semua"
                arrData={dataFilterTahun}
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
