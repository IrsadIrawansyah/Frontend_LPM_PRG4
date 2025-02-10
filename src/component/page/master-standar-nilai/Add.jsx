import { useRef, useState } from "react";
import { object, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Card from "../../part/Card";

export default function MasterStandarNilaiAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    score: "",
  });

  const userSchema = object({
    score: number()
      .typeError("harus diisi.")
      .min(1, " harus lebih dari 0.")
      .max(100, "Presentase tidak boleh lebih dari 100.")
      .required(" harus diisi."),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;

    const validationError = validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await UseFetch(
          API_LINK + "MasterStandarNilai/CreateStandarNilai",
          { ...formDataRef.current }
        );

        if (response === "ERROR" || !response) {
          throw new Error("Gagal menambahkan data standar nilai.");
        }

        SweetAlert(
          "Sukses",
          "Data standar nilai berhasil ditambahkan.",
          "success"
        );
        formDataRef.current.score = ""; // Reset form data
        setErrors({}); // Clear errors
        onChangePage("index"); // Beralih ke halaman index
      } catch (error) {
        setIsError(true);
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {isError && (
        <div className="mb-3">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal menambahkan data standar nilai."
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Tambah Data Standar Nilai">
          <div className="mb-3">
            <Input
              type="number"
              name="score"
              label="Standar Nilai"
              isRequired
              value={formDataRef.current.score}
              onChange={handleInputChange}
              errorMessage={errors.score}
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
            disabled={isLoading || Object.values(errors).some((error) => error)}
          />
        </div>
      </form>

      {isLoading && <Loading />}
    </>
  );
}
