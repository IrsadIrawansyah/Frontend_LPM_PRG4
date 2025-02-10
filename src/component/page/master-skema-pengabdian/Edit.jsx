import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Card from "../../part/Card";

export default function MasterSkemaPengabdianEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState([]); // Untuk menyimpan data yang ada

  const formDataRef = useRef({
    idSkemaPengabdian: "",
    namaSkemaPengabdian: "",
  });

  const userSchema = object({
    idSkemaPengabdian: string(),
    namaSkemaPengabdian: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi."),
    isUsed: string(),
  });

  // Fungsi untuk menormalisasi input
  const normalizeAndSortString = (str) => {
    const normalizedStr = str.trim().replace(/\s+/g, " ").toLowerCase();

    // Mengurutkan kata dalam string untuk membandingkan tanpa memperhatikan urutan kata
    return normalizedStr.split(" ").sort().join(" ");
  };

  // Fungsi untuk memeriksa duplikat
  const isDuplicate = (namaSkemaPengabdian) => {
    const normalizedNama = normalizeAndSortString(namaSkemaPengabdian);

    return existingData.some(
      (item) =>
        normalizeAndSortString(item["Skema Pengabdian"]) === normalizedNama &&
        item.idSkemaPengabdian !== formDataRef.current.idSkemaPengabdian // Mengecualikan ID yang sedang diedit
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const namaBaru = formDataRef.current.namaSkemaPengabdian;

    // Normalisasi dan cek duplikasi menggunakan data dari API
    const isDuplicateData = isDuplicate(namaBaru);

    if (isDuplicateData) {
      // Set error pada field langsung, bukan setIsError untuk Alert
      setErrors((prevErrors) => ({
        ...prevErrors,
        namaSkemaPengabdian:
          "Nama skema pengabdian sudah ada. Silakan coba nama lain.",
      }));
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterSkemaPengabdian/EditSkemaPengabdian",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data skema pengabdian."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Data skema pengabdian berhasil disimpan",
            "success"
          );
          onChangePage("index");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      try {
        // Ambil data skema pengabdian untuk ID yang sedang diedit
        const dataById = await UseFetch(
          API_LINK + "MasterSkemaPengabdian/GetDataSkemaPengabdianById",
          { id: withID }
        );

        if (dataById === "ERROR" || dataById.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data skema pengabdian."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...dataById[0] };
        }

        // Ambil semua data skema pengabdian dari API dengan paginasi
        while (hasMoreData) {
          const data = await UseFetch(
            API_LINK + "MasterSkemaPengabdian/GetDataSkemaPengabdian",
            { page: currentPage, query: "" }
          );

          if (data === "ERROR") {
            setIsError({
              error: true,
              message: "Terjadi kesalahan saat mengambil data dari server.",
            });
            hasMoreData = false;
          } else if (data.length > 0) {
            allData = [...allData, ...data];
            currentPage += 1;
            // Asumsi: Jika jumlah data yang diambil kurang dari 10, berarti sudah tidak ada data lagi
            if (data.length < 10) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        }

        setExistingData(allData);
      } catch (error) {
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [withID]);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        <form onSubmit={handleEdit}>
          <Card title="Edit Skema Pengabdian">
            <div className="mb-3">
              <Input
                type="text"
                name="namaSkemaPengabdian"
                label="Nama Skema Pengabdian"
                isRequired
                value={formDataRef.current.namaSkemaPengabdian}
                onChange={handleInputChange}
                errorMessage={errors.namaSkemaPengabdian}
              />
            </div>
          </Card>

          <div className="d-flex justify-content-start my-4">
            <Button
              classType="secondary me-2 px-4 py-2"
              label="Kembali"
              onClick={() => onChangePage("index")}
            />
            <Button
              classType="primary px-4 py-2"
              type="submit"
              label="Simpan"
              disabled={isLoading}
            />
          </div>

          {isLoading && <Loading />}
        </form>
      )}
    </>
  );
}
