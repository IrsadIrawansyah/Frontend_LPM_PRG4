import { useEffect, useRef, useState } from "react";
import { object, string, number } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Card from "../../part/Card";

export default function MasterBobotAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingPercentages, setExistingPercentages] = useState(0);
  const [existingData, setExistingData] = useState([]);

  const formDataRef = useRef({
    kontenPenilaian: "",
    percent: "",
  });

  useEffect(() => {
    const fetchExistingData = async () => {
      setIsLoading(true);
      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      try {
        // Mengambil data dari API dengan paginasi
        while (hasMoreData) {
          const response = await UseFetch(
            API_LINK + "MasterBobot/GetDataBobot",
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

        setExistingPercentages(parseFloat(allData[0]?.TotalPersentase) || 0);
        setExistingData(allData); // Menyimpan data yang ada dari API
      } catch (error) {
        console.error("Error fetching existing data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const userSchema = object({
    kontenPenilaian: string().required("Harus diisi."),
    percent: number()
      .typeError("Presentase harus berupa angka.")
      .min(1, "Presentase harus lebih dari 0.")
      .max(100, "Presentase tidak boleh lebih dari 100.")
      .test(
        "totalPercentageLimit",
        "Total presentase tidak boleh melebihi 100%.",
        (value) => {
          return existingPercentages + (value || 0) <= 100;
        }
      )
      .required("Presentase harus diisi."),
  });

  // Fungsi untuk menormalisasi dan mengurutkan string
  const normalizeAndSortString = (str) => {
    const normalizedStr = str.trim().replace(/\s+/g, " ").toLowerCase();

    return normalizedStr.split(" ").sort().join(" ");
  };

  // Fungsi untuk memeriksa duplikat
  const isDuplicate = (kontenPenilaian) => {
    const kontenBaru = normalizeAndSortString(kontenPenilaian);

    const allData = [
      ...existingData,
      ...(JSON.parse(localStorage.getItem("MasterBobotData")) || []),
    ];

    return allData.some(
      (item) =>
        item["Konten Penilaian"] &&
        normalizeAndSortString(item["Konten Penilaian"]) === kontenBaru
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;

    const validationError = validateInput(name, value, userSchema);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));

    if (name === "percent") {
      const numericValue = parseFloat(value) || 0;
      if (existingPercentages + numericValue > 100) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          percent: "Total presentase tidak boleh melebihi 100%.",
        }));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    const newPercentage = parseFloat(formDataRef.current.percent) || 0;
    if (existingPercentages + newPercentage > 100) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        percent: "Total presentase tidak boleh melebihi 100%.",
      }));
      return;
    }

    // Validasi duplikasi
    const kontenPenilaian = formDataRef.current.kontenPenilaian.trim();
    if (isDuplicate(kontenPenilaian)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        kontenPenilaian: "Konten Penilaian sudah ada, gunakan nama lain.",
      }));
      return;
    }

    // Jika tidak ada error validasi Yup
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await UseFetch(`${API_LINK}MasterBobot/CreateBobot`, {
          bbt_konten_penilaian: kontenPenilaian,
          bbt_percent: parseFloat(formDataRef.current.percent),
        });

        if (response === "ERROR" || !response) {
          throw new Error("Gagal menambahkan data bobot.");
        }

        SweetAlert("Sukses", "Data bobot berhasil ditambahkan.", "success");
        onChangePage("index");
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
            message="Terjadi kesalahan: Gagal menambahkan data bobot."
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Tambah Data Bobot">
          <div className="mb-3">
            <Input
              type="text"
              name="kontenPenilaian"
              label="Konten Penilaian"
              isRequired
              value={formDataRef.current.kontenPenilaian}
              onChange={handleInputChange}
              errorMessage={errors.kontenPenilaian}
            />
          </div>
          <div className="mb-3">
            <Input
              type="number"
              name="percent"
              label="Presentase (%)"
              isRequired
              value={formDataRef.current.percent}
              onChange={handleInputChange}
              errorMessage={errors.percent}
            />
            <div className="mt-2">
              <Alert
                type="info"
                message={`Total presentase saat ini: ${existingPercentages}%`}
              />
            </div>
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
            disabled={isLoading || errors.percent || existingPercentages >= 100}
          />
        </div>
      </form>

      {isLoading && <Loading />}
    </>
  );
}
