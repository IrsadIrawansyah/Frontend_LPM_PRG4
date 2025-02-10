import { useEffect, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function EditStandarNilai({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    score: "",
  });

  // Skema validasi input menggunakan Yup
  const userSchema = object({
    score: number()
      .typeError("Nilai harus berupa angka.")
      .min(1, "Nilai tidak boleh kurang dari 0.")
      .max(100, "Nilai tidak boleh lebih dari 100.")
      .required("Nilai harus diisi."),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          `${API_LINK}MasterStandarNilai/GetDataStandarNilaiById`,
          {
            std_id: withID,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Gagal mengambil data Standar Nilai.");
        }

        setFormData({
          score: data[0].score ? data[0].score.toString() : "",
        });
      } catch (error) {
        setIsError(true);
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  // Handle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    const validationError = validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validationError.error || "",
    }));
  };

  // Handle penyimpanan data
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError(false);

      try {
        const requestData = {
          std_id: withID,
          std_score: parseFloat(formData.score),
        };

        const response = await UseFetch(
          `${API_LINK}MasterStandarNilai/EditStandarNilai`,
          requestData
        );

        if (response === "ERROR") {
          throw new Error("Gagal menyimpan data Standar Nilai.");
        }

        SweetAlert(
          "Sukses",
          "Data Standar Nilai berhasil disimpan.",
          "success"
        );
        onChangePage("index");
      } catch (error) {
        setIsError(true);
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Tampilkan pesan error validasi
      const firstError = Object.values(validationErrors).find((error) => error);
      if (firstError) {
        SweetAlert("Error", firstError, "error");
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal menyimpan data Standar Nilai."
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div
          className="card"
          style={{
            backgroundColor: "#FFFFFF",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#EEEEEE",
              color: "#000",
              fontWeight: "bold",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            Ubah Data Standar Nilai
          </div>
          <div className="card-body p-4">
            <div className="mb-3">
              <Input
                type="text"
                name="score"
                label="Standar Nilai"
                isRequired
                value={formData.score}
                onChange={handleInputChange}
                errorMessage={errors.score}
              />
            </div>
          </div>
        </div>

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
    </>
  );
}
