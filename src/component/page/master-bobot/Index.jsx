import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
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
    "Konten Penilaian": null,
    "Presentase (%)": null,
    Count: 0,
  },
];

export default function MasterBobotIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
  });

  const searchQuery = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prev) => ({
      ...prev,
      page: newCurrentPage,
    }));
  }

  async function handleSearch() {
    try {
      const searchValue = searchQuery.current.value.trim();
      setCurrentFilter((prev) => ({
        ...prev,
        query: searchValue,
        page: 1,
      }));
    } catch (error) {
      SweetAlert("Error", error.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      const confirmation = await SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin menghapus data ini?",
        "warning",
        "Ya"
      );

      if (confirmation) {
        const response = await UseFetch(API_LINK + "MasterBobot/DeleteBobot", {
          id,
        });

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
        const response = await UseFetch(API_LINK + "MasterBobot/GetDataBobot", {
          p1: currentFilter.page,
          p2: currentFilter.query,
        });

        if (response === "ERROR") {
          setIsError(true);
          setCurrentData(inisialisasiData);
        } else if (!response || response.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const totalPersentase = parseFloat(response[0]?.TotalPersentase) || 0;

          const formattedData = response.map((item, index) => ({
            Key: item.Key,
            No: item.No,
            "Konten Penilaian": item["Konten Penilaian"],
            "Presentase (%)": `${item["Persentase %"]}%`,
            Aksi: ["Edit", "Delete"],
            Count: item.Count,
            Alignment: ["center", "left", "center", "center"],
          }));
          setCurrentData(formattedData);
          // Tambahkan baris berikut:
          localStorage.setItem(
            "MasterBobotData",
            JSON.stringify(formattedData)
          );
        }
      } catch (error) {
        console.error("Error:", error);
        setIsError(true);
        setCurrentData(inisialisasiData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data bobot."
          />
        </div>
      )}
      <div className="flex-fill">
        <div className="input-group mb-3">
          <Button
            iconName="add"
            classType="success"
            label="Tambah"
            onClick={() => onChangePage("add")}
          />
          <Input
            ref={searchQuery}
            forInput="pencarianBobot"
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

// import { useEffect, useRef, useState } from "react";
// import { PAGE_SIZE, API_LINK } from "../../util/Constants";
// import UseFetch from "../../util/UseFetch";
// import Button from "../../part/Button";
// import Input from "../../part/Input";
// import Table from "../../part/Table";
// import Paging from "../../part/Paging";
// import Alert from "../../part/Alert";
// import Loading from "../../part/Loading";
// import SweetAlert from "../../util/SweetAlert";

// const inisialisasiData = [
//   {
//     Key: null,
//     No: null,
//     "Konten Penilaian": null,
//     "Persentase %": null,
//     Count: 0,
//   },
// ];

// export default function MasterBobotIndex({ onChangePage }) {
//   const [isError, setIsError] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentData, setCurrentData] = useState(inisialisasiData);
//   const [currentFilter, setCurrentFilter] = useState({
//     page: 1,
//     query: "",
//   });

//   const [totalPercentage, setTotalPercentage] = useState(0); // State untuk menyimpan total persentase

//   const searchQuery = useRef();

//   function handleSetCurrentPage(newCurrentPage) {
//     setIsLoading(true);
//     setCurrentFilter((prev) => ({
//       ...prev,
//       page: newCurrentPage,
//     }));
//   }

//   async function handleDelete(id) {
//     try {
//       const confirmation = await SweetAlert(
//         "Konfirmasi",
//         "Apakah Anda yakin ingin menghapus data ini?",
//         "warning",
//         (confirm = "Ya")
//       );

//       if (confirmation) {
//         const response = await UseFetch(API_LINK + "MasterBobot/DeleteBobot", {
//           id,
//         });

//         if (response === "ERROR") {
//           throw new Error("Gagal menghapus data");
//         }

//         SweetAlert("Sukses", "Data berhasil dihapus", "success");
//         setCurrentFilter((prev) => ({ ...prev }));
//       }
//     } catch (error) {
//       SweetAlert("Error", error.message, "error");
//     }
//   }

//   function handleSearch() {
//     setIsLoading(true);
//     setCurrentFilter((prevFilter) => ({
//       ...prevFilter,
//       page: 1,
//       query: searchQuery.current.value,
//     }));
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsError(false);

//       try {
//         const data = await UseFetch(
//           API_LINK + "MasterBobot/GetDataBobot",
//           currentFilter
//         );

//         if (data === "ERROR") {
//           setIsError(true);
//         } else if (data.length === 0) {
//           setCurrentData(inisialisasiData);
//           setTotalPercentage(0); // Set total percentage to 0 when no data
//         } else {
//           const formattedData = data.map((value) => ({
//             ...value,
//             Aksi: ["Edit", "Delete"],
//             Alignment: ["center", "center", "center", "center"],
//           }));
//           setCurrentData(formattedData);

//           // Calculate total percentage
//           const total = data.reduce(
//             (sum, item) => sum + (parseFloat(item["Persentase %"]) || 0),
//             0
//           );
//           setTotalPercentage(total); // Update total percentage state
//         }
//       } catch {
//         setIsError(true);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentFilter]);

//   return (
//     <div className="d-flex flex-column">
//       {isError && (
//         <div className="flex-fill">
//           <Alert
//             type="warning"
//             message="Terjadi kesalahan: Gagal mengambil data bobot."
//           />
//         </div>
//       )}
//       <div className="flex-fill">
//         <div className="input-group mb-3">
//           <Button
//             iconName="add"
//             classType="success"
//             label="Tambah"
//             onClick={() => {
//               if (totalPercentage < 100) {
//                 onChangePage("add");
//               } else {
//                 SweetAlert(
//                   "Informasi",
//                   "Presentase sudah mencapai 100%",
//                   "info"
//                 );
//               }
//             }}
//             disabled={totalPercentage >= 100} // Disable if total is 100%
//           />
//           <Input
//             ref={searchQuery}
//             forInput="pencarianBobot"
//             placeholder="Cari"
//             onChange={handleSearch} // Ensure the search is triggered
//           />
//           <Button
//             iconName="search"
//             classType="primary px-4"
//             title="Cari"
//             onClick={handleSearch}
//           />
//         </div>
//       </div>
//       <div className="table-responsive">
//         {isLoading ? (
//           <Loading />
//         ) : (
//           <div className="d-flex flex-column">
//             <Table
//               data={currentData}
//               onEdit={(edit, id) => onChangePage("edit", id)}
//               onDelete={handleDelete}
//               className="text-center"
//             />
//             <Paging
//               pageSize={PAGE_SIZE}
//               pageCurrent={currentFilter.page}
//               totalData={currentData[0]?.Count || 0}
//               navigation={handleSetCurrentPage}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
