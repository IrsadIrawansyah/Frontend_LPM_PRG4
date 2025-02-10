import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import FileUpload from "../../part/FileUpload";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Card from "../../part/Card";

export default function MasterTemplateDokumenEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState([]);
  const formDataRef = useRef({
    idTemplateDokumen: "",
    namaTemplateDokumen: "",
    fileTemplateDokumen: "",
    isUsed: "",
  });

  const fileTemplateDokumenRef = useRef(null);
  const userSchema = object({
    idTemplateDokumen: string(),
    namaTemplateDokumen: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    fileTemplateDokumen: string(),
    isUsed: string(),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = () => {
    const file = fileTemplateDokumenRef.current.files[0];
    if (!file) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen: "File harus diunggah",
      }));
      return;
    }

    const fileSize = file.size / 1024 / 1024;
    const allowedExtensions = ["pdf", "docx", "xlsx"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileSize > 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen: "Ukuran file maksimum 10MB",
      }));
      fileTemplateDokumenRefRef.current.value = "";
    } else if (!allowedExtensions.includes(fileExt)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        fileTemplateDokumen:
          "Hanya file dengan ekstensi pdf dan word diperbolehkan",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      const namaBaru = formDataRef.current.namaTemplateDokumen
        .trim()
        .toLowerCase();
      const idSekarang = formDataRef.current.idTemplateDokumen;

      const isDuplicate = existingData.some((item) => {
        if (!item["Nama Template Dokumen"] || !item.Key) return false;
        return (
          item.Key !== idSekarang &&
          item["Nama Template Dokumen"].trim().toLowerCase() === namaBaru
        );
      });

      if (isDuplicate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          namaTemplateDokumen:
            "Nama Template Dokumen sudah ada, gunakan nama lain.",
        }));
        return;
      }

      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        let updatedFormData = { ...formDataRef.current };
        if (fileTemplateDokumenRef.current?.files?.length > 0) {
          const uploadResult = await UploadFile(fileTemplateDokumenRef.current);
          if (uploadResult.Hasil) {
            updatedFormData.fileTemplateDokumen = uploadResult.Hasil;
          }
        }

        const response = await UseFetch(
          API_LINK + "MasterTemplateDokumen/EditTemplateDokumen",
          updatedFormData
        );

        if (response === "ERROR") {
          throw new Error("Gagal menyimpan data template dokumen.");
        }

        SweetAlert(
          "Sukses",
          "Data template dokumen berhasil disimpan",
          "success"
        );
        onChangePage("index");
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({ error: true, message: error.message });
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + "MasterTemplateDokumen/GetDataTemplateDokumenById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data template dokumen."
          );
        } else {
          formDataRef.current = data[0];
        }
        let allData = [];
        let currentPage = 1;
        let hasMoreData = true;

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
        window.scrollTo(0, 0);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Ubah Data Template Dokumen">
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
            hasExisting={formDataRef.current.fileTemplateDokumen}
            ref={fileTemplateDokumenRef}
            onChange={() =>
              handleFileChange(fileTemplateDokumenRef, "jpg,png,pdf,zip")
            }
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
