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
    Key2: null,
    No: null,
    "No. Proposal": null,
    "Judul Proposal": null,
    "Skema Pengabdian": null,
    "Ketua Pengusul": null,
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
  { Value: "Proses Penilaian", Text: "Proses Penilaian" },
];

export default function ProsesPengecekanProposalIndex({ onChangePage }) {
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

  async function handleSent(id) {
    const result = await SweetAlert(
      "Yakin Kirim Penilaian Proposal?",
      "Setelah proposal ini dikirim, Penilaian tidak bisa diedit lagi. Pastikan semua sudah benar sebelum mengirim.",
      "warning",
      "Ya, Kirim!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      console.log(id);
      UseFetch(API_LINK + "ReviewProposal/SentReviewerPenilaianProposal", {
        idProposal: id,
      })
        .then((data) => {
          if (data === "ERROR" || data.length === 0) setIsError(true);
          else {
            SweetAlert(
              "Mantap!",
              "Data penilaian proposalnya udah berhasil dikirim, nih! 👍",
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

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "ReviewProposal/GetDataReviewerPenilaianProposal",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            let aksi = [];
            if (value["Key2"]) {
              aksi = ["Detail", "Sent"];
            } else {
              aksi = ["Detail"];
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
          console.log(formattedData);
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
