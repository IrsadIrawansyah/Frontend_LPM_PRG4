import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";

export default function MasterRumpunIlmuEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState([]);

  const formDataRef = useRef({
    idRumpunIlmu: "",
    namaRumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
  });

  const originalCabangIlmuRef = useRef("");

  const userSchema = object({
    idRumpunIlmu: string(),
    namaRumpunIlmu: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    pohonIlmu: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    cabangIlmu: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
  });

  const isDuplicate = (cabangIlmu) => {
    return (
      cabangIlmu.toLowerCase() !==
        originalCabangIlmuRef.current.toLowerCase() &&
      existingData.some(
        (item) =>
          item["Cabang Ilmu"].toLowerCase() === cabangIlmu.toLowerCase() &&
          item.idRumpunIlmu !== formDataRef.current.idRumpunIlmu
      )
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        try {
          const data = await UseFetch(
            API_LINK + "masterRumpunIlmu/GetDataRumpunIlmu",
            { page: currentPage, query: "" }
          );

          if (data === "ERROR") {
            setIsError(true);
            break;
          } else {
            allData = [...allData, ...data];
            if (data.length < 10) {
              hasMoreData = false;
            } else {
              currentPage++;
            }
          }
        } catch (error) {
          setIsError(true);
          break;
        }
      }

      setExistingData(allData);

      try {
        const data = await UseFetch(
          API_LINK + "masterRumpunIlmu/GetDataRumpunIlmuById",
          { id: withID }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data rumpun ilmu."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          originalCabangIlmuRef.current = data[0].cabangIlmu;
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
    };

    fetchData();
  }, [withID]);

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

    if (isDuplicate(formDataRef.current.cabangIlmu)) {
      setErrors({
        ...errors,
        cabangIlmu: "Cabang ilmu sudah ada. Silakan coba nama lain.",
      });
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
          API_LINK + "masterRumpunIlmu/EditRumpunIlmu",
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
        setIsError({
          error: true,
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <Card title="Edit Rumpun Ilmu">
          <div className="mb-3">
            <Input
              type="text"
              name="namaRumpunIlmu"
              label="Rumpun Ilmu"
              isRequired
              value={formDataRef.current.namaRumpunIlmu}
              onChange={handleInputChange}
              errorMessage={errors.namaRumpunIlmu}
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
