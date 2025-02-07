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

export default function MasterTemplateDokumenAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState([]); // Menyimpan semua data yang ada

  const formDataRef = useRef({
    namaTemplateDokumen: "",
    fileTemplateDokumen: "",
  });

  const fileTemplateDokumenRef = useRef(null);
  const userSchema = object({
    namaTemplateDokumen: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    fileTemplateDokumen: string().required(
      "Data Template Dokumen harus diunggah"
    ),
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
  const isDuplicate = (namaTemplateDokumen) => {
    const namaBaru = normalizeAndSortString(namaTemplateDokumen);
    const allData = [
      ...existingData,
      ...(JSON.parse(localStorage.getItem("MasterTemplateDokumenData")) || []),
    ];

    return allData.some(
      (item) =>
        item["Nama Template Dokumen"] &&
        normalizeAndSortString(item["Nama Template Dokumen"]) === namaBaru
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
            API_LINK + "MasterTemplateDokumen/GetDataTemplateDokumen",
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
    const file = fileTemplateDokumenRef.current.files[0];
    if (!file) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen: "File harus diunggah",
      }));
      return;
    }

    const fileSize = file.size / 1024 / 1024; // Ukuran dalam MB
    const allowedExtensions = ["pdf", "docx", "xlsx"]; // Daftar ekstensi yang diperbolehkan
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileSize > 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen: "Ukuran file maksimum 10MB",
      }));
      fileTemplateDokumenRef.current.value = "";
    } else if (!allowedExtensions.includes(fileExt)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen:
          "Hanya file dengan ekstensi pdf , docx dan excel yang diperbolehkan",
      }));
      fileTemplateDokumenRef.current.value = "";
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen: "",
      }));
      formDataRef.current["fileTemplateDokumen"] = file;
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
      const namaTemplateDokumen =
        formDataRef.current.namaTemplateDokumen.trim();
      if (isDuplicate(namaTemplateDokumen)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          namaTemplateDokumen:
            "Nama Template Dokumen sudah ada, gunakan nama lain.",
        }));
        return; // hentikan proses jika duplikat
      }

      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        // Upload file jika ada
        let filePath = "";
        if (formDataRef.current.fileTemplateDokumen) {
          const fileData = await UploadFile(fileTemplateDokumenRef.current);
          filePath = fileData.Hasil;
        }

        const requestData = {
          namaTemplateDokumen: formDataRef.current.namaTemplateDokumen,
          fileTemplateDokumen: filePath,
        };

        const response = await UseFetch(
          API_LINK + "MasterTemplateDokumen/CreateTemplateDokumen",
          requestData
        );

        if (response === "ERROR") {
          throw new Error("Terjadi kesalahan saat menyimpan data.");
        }

        SweetAlert("Sukses", "Template Dokumen berhasil disimpan.", "success");
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
      <Card title="Tambah Data Template Dokumen">
        <div className="mb-3">
          <Input
            type="text"
            name="namaTemplateDokumen"
            label="Nama Template Dokumen"
            isRequired
            value={formDataRef.current.namaTemplateDokumen}
            onChange={handleInputChange}
            errorMessage={errors.namaTemplateDokumen}
          />
        </div>
        <div className="mb-3">
          <FileUpload
            name="fileTemplateDokumen"
            label="Template Dokumen (PDF , Word & Excel)"
            formatFile=".pdf, .docx, .xlsx"
            isRequired
            ref={fileTemplateDokumenRef}
            onChange={handleFileChange}
            errorMessage={errors.fileTemplateDokumen}
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
