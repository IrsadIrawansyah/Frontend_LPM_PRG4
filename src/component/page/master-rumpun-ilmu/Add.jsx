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

export default function MasterRumpunIlmuAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState([]);
  const formDataRef = useRef({
    rumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
  });

  const userSchema = object({
    rumpunIlmu: string().required("harus diisi."),
    pohonIlmu: string().required("harus diisi."),
    cabangIlmu: string().required("harus diisi."),
  });

  const isDuplicate = (cabangIlmu) => {
    return existingData.some(
      (item) => item["Cabang Ilmu"].toLowerCase() === cabangIlmu.toLowerCase()
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

    // Cek duplikat berdasarkan data yang ada (dari API)
    if (isDuplicate(formDataRef.current.cabangIlmu)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        cabangIlmu: "Cabang ilmu sudah ada. Silakan coba nama lain.",
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
          API_LINK + "MasterRumpunIlmu/CreateRumpunIlmu",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data rumpun ilmu."
          );
        } else {
          SweetAlert("Sukses", "Data rumpun ilmu berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError(true);
        setIsError((prevError) => ({
          ...prevError,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        try {
          const data = await UseFetch(
            API_LINK + "MasterRumpunIlmu/GetDataRumpunIlmu",
            { page: currentPage, query: "" }
          );

          if (data === "ERROR") {
            setIsError(true);
            break;
          } else {
            allData = [...allData, ...data]; // Gabungkan data yang sudah diambil
            if (data.length < 10) {
              hasMoreData = false; // Jika data kurang dari 10, berarti ini adalah halaman terakhir
            } else {
              currentPage++; // Lanjutkan ke halaman berikutnya
            }
          }
        } catch (error) {
          setIsError(true);
          break;
        }
      }

      // Setelah mendapatkan seluruh data, set ke state
      setExistingData(allData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {isError && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <Card title="Tambah rumpun ilmu">
          <div className="mb-3">
            <Input
              type="text"
              name="rumpunIlmu"
              label="Rumpun Ilmu"
              isRequired
              value={formDataRef.current.rumpunIlmu}
              onChange={handleInputChange}
              errorMessage={errors.rumpunIlmu}
            />
          </div>
          <div className="mb-3">
            <Input
              type="text"
              name="pohonIlmu"
              label="Pohon Ilmu"
              isRequired
              value={formDataRef.current.pohonIlmu}
              onChange={handleInputChange}
              errorMessage={errors.pohonIlmu}
            />
          </div>
          <div className="mb-3">
            <Input
              type="text"
              name="cabangIlmu"
              label="Cabang Ilmu"
              isRequired
              value={formDataRef.current.cabangIlmu}
              onChange={handleInputChange}
              errorMessage={errors.cabangIlmu}
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
