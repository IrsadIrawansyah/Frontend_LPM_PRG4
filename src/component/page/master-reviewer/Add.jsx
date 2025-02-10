import { useState, useEffect, useRef } from "react";
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
import DropDown from "../../part/Dropdown";

export default function MasterReviewerAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listReviewer, setListReviewer] = useState({});
  const formDataRef = useRef({
    namaReviewer: "",
  });

  const userSchema = object({
    namaReviewer: string().required("harus dipilih"),
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

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") {
        throw new Error(errorMessage);
      } else {
        setter(data);
      }
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setter({});
    }
  };

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterKaryawan/GetListKaryawanReviewer",
      {},
      setListReviewer,
      "Terjadi kesalahan: Gagal mengambil daftar karyawan."
    );
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const uploadPromises = [];

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterReviewer/CreateReviewer",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data reviewer.");
        } else {
          SweetAlert("Sukses", "Data reviewer berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else window.scrollTo(0, 0);
  };

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <Card title="Tambah Reviewer">
          <div className="col-lg-3">
            <DropDown
              forInput="namaReviewer"
              label="Nama Karyawan"
              arrData={listReviewer}
              isRequired
              value={formDataRef.current.namaReviewer}
              onChange={handleInputChange}
              errorMessage={errors.namaReviewer}
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
