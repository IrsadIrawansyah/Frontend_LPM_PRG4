import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Card from "../../part/Card";

export default function MasterReviewerEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKaryawan, setListKaryawan] = useState({});

  const formDataRef = useRef({
    namaReviewer: "",
    isUsed: "",
  });

  const userSchema = object({
    namaReviewer: string().required("harus dipilih"),
    isUsed: string(),
  });

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
      API_LINK + "MasterKaryawan/GetListKaryawan",
      {},
      setListKaryawan,
      "Terjadi kesalahan: Gagal mengambil daftar reviewer."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterReviewer/GetDataReviewerById",
          {
            skp_id: withID,
          }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data reviewer.");
        } else {
          formDataRef.current = {
            namaReviewer: data[0].namaReviewer,
            isUsed: data[0].isUsed,
          };
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

  const handleSubmit = async (e) => {
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

      try {
        const requestData = {
          rev_id: withID,
          kry_id: formDataRef.current.namaReviewer,
          // skp_modif_by: "SYSTEM",
          skp_modif_date: new Date().toISOString(),
        };

        console.log("Request Data:", requestData);

        const data = await UseFetch(
          API_LINK + "MasterReviewer/EditReviewer",
          requestData
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data reviewer.");
        } else {
          SweetAlert("Sukses", "Data reviewer berhasil disimpan", "success");
          onChangePage("index");
        }
      } catch (error) {
        console.error("Error:", error);
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Card title="Ubah Data Reviewer">
          <div className="row">
            <div className="col-lg-3">
              <DropDown
                forInput="namaReviewer"
                label="Nama Reviewer"
                arrData={listKaryawan}
                isRequired
                value={formDataRef.current.namaReviewer}
                onChange={handleInputChange}
                errorMessage={errors.namaReviewer}
              />
            </div>
          </div>
        </Card>
        <div className="d-flex justify-content-start mt-4">
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
    </>
  );
}

