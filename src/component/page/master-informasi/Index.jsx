import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Informasi": null,
    Count: 0,
  },
];

export default function MasterInformasiIndex({ onChangePage }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
  });

  const searchQuery = useRef();

  const handleSetCurrentPage = (newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prev) => ({
      ...prev,
      page: newCurrentPage,
    }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
    }));
  };

  async function handleDelete(id) {
    try {
      const confirmation = await SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin menghapus data ini?",
        "warning",
        (confirm = "Ya")
      );

      if (confirmation) {
        const response = await UseFetch(
          API_LINK + "MasterInformasi/DeleteInformasi",
          { id }
        );

        if (response === "ERROR") {
          throw new Error("Gagal menghapus data");
        }

        SweetAlert("Sukses", "Data berhasil dihapus", "success");
        setCurrentFilter((prev) => ({ ...prev }));
      }
    } catch (error) {
      SweetAlert("Error", error.message, "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "MasterInformasi/GetDataInformasi",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else {
          const formattedData = data.length
            ? data.map((value) => ({
                ...value,
                Aksi:
                  role === "ROL52"
                    ? ["Download", "Edit", "Delete"]
                    : ["Download"],
                Alignment: ["center", "left", "center", "center", "center"],
              }))
            : inisialisasiData;

          setCurrentData(formattedData);

          // Simpan data ke localStorage untuk pengecekan duplikat di Add/Edit
          localStorage.setItem(
            "MasterInformasiData",
            JSON.stringify(formattedData)
          );
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  const handleDownloadClick = async (id) => {
    if (!id) {
      SweetAlert("Peringatan", "ID file tidak tersedia.", "warning");
      return;
    }

    try {
      // Temukan item data berdasarkan id
      const foundItem = currentData.find((item) => item.Key === id);
      // Gunakan Nama Informasi atau fallback ke file_{id}
      const namaInformasi = foundItem
        ? foundItem["Nama Informasi"]
        : `file_${id}`;

      // Sanitasi nama file agar tidak ada karakter aneh
      const safeName = namaInformasi.replace(/[^a-zA-Z0-9_\- ]/g, "_");
      const namaFile = `${safeName}.pdf`;

      const response = await fetch(`${API_LINK}MasterInformasi/DownloadFile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengunduh file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = namaFile; // Gunakan Nama Informasi sebagai nama file
      document.body.appendChild(link);
      link.click(); // Unduh file
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Menghapus URL blob setelah digunakan
    } catch (error) {
      SweetAlert("Error", error.message, "error");
    }
  };

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data informasi."
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
            forInput="pencarianInformasi"
            placeholder="Cari"
          />
          <Button
            iconName="search"
            classType="primary px-4"
            title="Cari"
            onClick={handleSearch}
          />
        </div>
      </div>
      <div className="table-responsive">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="d-flex flex-column">
            <Table
              data={currentData}
              onEdit={(edit, id) => onChangePage("edit", id)}
              onDelete={handleDelete}
              onDownload={(id) => handleDownloadClick(id)}
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
