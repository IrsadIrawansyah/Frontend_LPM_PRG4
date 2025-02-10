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

export default function MasterSkemaPengabdianAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState([]);
  const formDataRef = useRef({
    namaSkemaPengabdian: "",
  });

  const userSchema = object({
    namaSkemaPengabdian: string().required("Harus diisi."),
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
        normalizeAndSortString(item["Skema Pengabdian"]) === normalizedNama
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

  const handleAdd = async (e) => {
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
      setIsError(false);
      setErrors({});

      try {
        const data = await UseFetch(
          API_LINK + "MasterSkemaPengabdian/CreateSkemaPengabdian",
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
          message: "Terjadi kesalahan saat mengambil data dari server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <Card title="Tambah Skema Pengabdian">
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
    </>
  );
}
