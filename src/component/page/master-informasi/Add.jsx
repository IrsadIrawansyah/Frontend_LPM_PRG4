import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Card from "../../part/Card"; // Import komponen Card

export default function MasterInformasiAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState([]); // Menyimpan semua data yang ada

  const formDataRef = useRef({
    namaInformasi: "",
    fileInformasi: "",
  });

  const fileInformasiRef = useRef(null);
  const userSchema = object({
    namaInformasi: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    fileInformasi: string().required("Data Informasi harus diunggah"),
  });

  const normalizeAndSortString = (str) => {
    return str
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .sort()
      .join(" ");
  };
  const isDuplicate = (namaInformasi) => {
    const namaBaru = normalizeAndSortString(namaInformasi);
    const allData = [
      ...existingData,
      ...(JSON.parse(localStorage.getItem("MasterInformasiData")) || []),
    ];

    return allData.some(
      (item) =>
        item["Nama Informasi"] &&
        normalizeAndSortString(item["Nama Informasi"]) === namaBaru
    );
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      setIsLoading(true);
      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      try {
        while (hasMoreData) {
          const response = await UseFetch(
            API_LINK + "MasterInformasi/GetDataInformasi",
            {
              p1: currentPage,
              p2: "",
            }
          );

          if (response && response !== "ERROR") {
            allData = [...allData, ...response];
            currentPage += 1;
            if (response.length < 10) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        }

        setExistingData(allData);
        console.log("Semua data telah diambil:", allData); // Debugging: Menampilkan semua data yang diambil
      } catch (error) {
        console.error("Error fetching existing data:", error);
        setIsError({
          error: true,
          message: "Terjadi kesalahan saat mengambil data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []); // Menjalankan sekali ketika komponen dimuat

  // Handle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  // Handle perubahan file
  const handleFileChange = () => {
    const file = fileInformasiRef.current.files[0];
    if (!file) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileInformasi: "File harus diunggah",
      }));
      return;
    }

    const fileSize = file.size / 1024 / 1024; // Ukuran dalam MB
    const allowedExtensions = ["pdf"]; // Daftar ekstensi yang diperbolehkan
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileSize > 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileInformasi: "Ukuran file maksimum 10MB",
      }));
      fileInformasiRef.current.value = "";
    } else if (!allowedExtensions.includes(fileExt)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileInformasi: "Hanya file dengan ekstensi pdf diperbolehkan",
      }));
      fileInformasiRef.current.value = "";
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileInformasi: "",
      }));
      formDataRef.current["fileInformasi"] = file;
    }
  };

  // Handle penyimpanan data
  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      // Validasi duplikasi
      const namaInformasi = formDataRef.current.namaInformasi.trim();
      if (isDuplicate(namaInformasi)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          namaInformasi: "Nama Informasi sudah ada, gunakan nama lain.",
        }));
        return; // hentikan proses jika duplikat
      }

      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        // Upload file jika ada
        let filePath = "";
        if (formDataRef.current.fileInformasi) {
          const fileData = await UploadFile(fileInformasiRef.current);
          filePath = fileData.Hasil;
        }

        const requestData = {
          namaInformasi: formDataRef.current.namaInformasi,
          fileInformasi: filePath,
        };

        const response = await UseFetch(
          API_LINK + "MasterInformasi/CreateInformasi",
          requestData
        );

        if (response === "ERROR") {
          throw new Error("Terjadi kesalahan saat menyimpan data.");
        }

        SweetAlert("Sukses", "Informasi berhasil disimpan.", "success");
        onChangePage("index");
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <form onSubmit={handleAdd}>
      <Card title="Tambah Data Informasi">
        <div className="mb-3">
          <Input
            type="text"
            name="namaInformasi"
            label="Nama Informasi"
            isRequired
            value={formDataRef.current.namaInformasi}
            onChange={handleInputChange}
            errorMessage={errors.namaInformasi}
          />
        </div>
        <div className="mb-3">
          <FileUpload
            name="fileInformasi"
            label="Informasi (PDF)"
            formatFile=".pdf"
            isRequired
            ref={fileInformasiRef}
            onChange={handleFileChange}
            errorMessage={errors.fileInformasi}
          />
        </div>
      </Card>

      <div className="d-flex justify-content-start my-4">
        <Button
          type="button"
          classType="secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("index")}
        />
        <Button
          type="submit"
          classType="primary px-4 py-2"
          label="Simpan"
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
