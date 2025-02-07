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

export default function MasterInformasiEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState([]);
  const [informasi, setInformasi] = useState([]);
  const formDataRef = useRef({
    idInformasi: "",
    namaInformasi: "",
    dokumenInformasi: "",
  });

  const fileInformasiRef = useRef(null);
  const userSchema = object({
    idInformasi: string(),
    namaInformasi: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    dokumenInformasi: string(),
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
    const file = fileInformasiRef.current.files[0];
    if (!file) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dokumenInformasi: "File harus diunggah",
      }));
      return;
    }

    const fileSize = file.size / 1024 / 1024;
    const allowedExtensions = ["pdf"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileSize > 10) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dokumenInformasi: "Ukuran file maksimum 10MB",
      }));
      fileInformasiRef.current.value = "";
    } else if (!allowedExtensions.includes(fileExt)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dokumenInformasi: "Hanya file dengan ekstensi pdf diperbolehkan",
      }));
      fileInformasiRef.current.value = "";
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dokumenInformasi: "",
      }));
      formDataRef.current["dokumenInformasi"] = file;
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
      const namaBaru = formDataRef.current.namaInformasi.trim().toLowerCase();
      const idSekarang = formDataRef.current.idInformasi;

      const isDuplicate = existingData.some((item) => {
        if (!item["Nama Informasi"] || !item.Key) return false;
        return (
          item.Key !== idSekarang &&
          item["Nama Informasi"].trim().toLowerCase() === namaBaru
        );
      });

      if (isDuplicate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          namaInformasi: "Nama Informasi sudah ada, gunakan nama lain.",
        }));
        return;
      }

      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        let updatedFormData = { ...formDataRef.current };
        if (fileInformasiRef.current?.files?.length > 0) {
          const uploadResult = await UploadFile(fileInformasiRef.current);
          if (uploadResult.Hasil) {
            updatedFormData.dokumenInformasi = uploadResult.Hasil;
          }
        }

        const response = await UseFetch(
          API_LINK + "MasterInformasi/EditInformasi",
          updatedFormData
        );

        if (response === "ERROR") {
          throw new Error("Gagal menyimpan data informasi.");
        }

        SweetAlert("Sukses", "Data informasi berhasil disimpan", "success");
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
          API_LINK + "MasterInformasi/GetDataInformasiById",
          { id: withID }
        );

        setInformasi(data[0].dokumenInformasi);
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data informasi.");
        } else {
          formDataRef.current = data[0];
        }
        let allData = [];
        let currentPage = 1;
        let hasMoreData = true;

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
      <Card title="Ubah Data Informasi">
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
            hasExisting={informasi}
            ref={fileInformasiRef}
            onChange={() =>
              handleFileChange(fileInformasiRef, "jpg,png,pdf,zip")
            }
            errorMessage={errors.dokumenInformasi}
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
