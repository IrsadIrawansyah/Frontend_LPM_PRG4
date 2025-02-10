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

export default function MasterBobotEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingPercentages, setExistingPercentages] = useState(0);
  const [kontenPenilaian, setKontenPenilaian] = useState("");
  const [percent, setPercent] = useState("");
  const [existingData, setExistingData] = useState([]); // Menyimpan semua data bobot yang ada

  const userSchema = object({
    kontenPenilaian: string().required("Konten Penilaian harus diisi."),
    percent: number()
      .typeError("Presentase harus berupa angka.")
      .min(1, "Presentase harus lebih dari 0.")
      .max(100, "Presentase tidak boleh lebih dari 100%.")
      .test(
        "totalPercentageLimit",
        "Total presentase tidak boleh melebihi 100%.",
        (value) => {
          return existingPercentages + (value || 0) <= 100;
        }
      )
      .required("Presentase harus diisi."),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      try {
        // Ambil data bobot berdasarkan ID yang sedang diedit
        const data = await UseFetch(`${API_LINK}MasterBobot/GetDataBobotById`, {
          bbt_id: withID,
        });

        if (data === "ERROR" || !data || data.length === 0) {
          throw new Error("Gagal mengambil data bobot.");
        }

        // Set data konten penilaian dan presentase
        const currentKonten = data[0].kontenPenilaian || "";
        const currentPercentValue =
          data[0].presentase !== undefined ? parseFloat(data[0].presentase) : 0;

        setKontenPenilaian(currentKonten);
        setPercent(currentPercentValue ? currentPercentValue.toString() : "");

        // Ambil semua data bobot yang ada untuk pengecekan duplikasi
        while (hasMoreData) {
          const response = await UseFetch(
            API_LINK + "MasterBobot/GetDataBobot",
            {
              p1: currentPage,
              p2: "",
            }
          );

          if (response === "ERROR") {
            setIsError(true);
            setExistingData([]);
            hasMoreData = false;
          } else if (response.length > 0) {
            allData = [...allData, ...response];
            currentPage += 1;
            if (response.length < 10) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        }

        setExistingData(allData); // Menyimpan data bobot yang ada
        const totalPersentase = parseFloat(allData[0]?.TotalPersentase) || 0;
        const existing = totalPersentase - currentPercentValue;
        setExistingPercentages(existing < 0 ? 0 : existing);
      } catch (error) {
        setIsError(true);
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]); // Menyertakan withID sebagai dependensi

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "kontenPenilaian") {
      setKontenPenilaian(value);
    } else if (name === "percent") {
      setPercent(value);
    }

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

    const formData = {
      kontenPenilaian,
      percent,
    };

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    const newPercentage = parseFloat(percent) || 0;
    if (existingPercentages + newPercentage > 100) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        percent: "Total presentase tidak boleh melebihi 100%.",
      }));
      return;
    }

    // Validasi duplikasi
    const kontenPenilaianTrimmed = kontenPenilaian.trim().toLowerCase();
    const isDuplicate = existingData.some(
      (item) =>
        item["Konten Penilaian"] &&
        item.Key !== withID && // Pastikan bukan data yang sedang diedit
        item["Konten Penilaian"].trim().toLowerCase() === kontenPenilaianTrimmed
    );

    if (isDuplicate) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        kontenPenilaian: "Konten Penilaian sudah ada, gunakan nama lain.",
      }));
      return;
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError(false);

      try {
        const requestData = {
          bbt_id: withID,
          bbt_konten_penilaian: kontenPenilaian.trim(),
          bbt_percent: newPercentage,
        };

        const response = await UseFetch(
          `${API_LINK}MasterBobot/EditBobot`,
          requestData
        );

        if (response === "ERROR") {
          throw new Error("Gagal menyimpan data bobot.");
        }

        SweetAlert("Sukses", "Data bobot berhasil disimpan.", "success");
        onChangePage("index");
      } catch (error) {
        setIsError(true);
        SweetAlert("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const newPercentage = parseFloat(percent) || 0;
  const totalAfterEdit = existingPercentages + newPercentage;
  const isDisabled =
    isLoading ||
    errors.percent ||
    totalAfterEdit > 100 ||
    existingPercentages >= 100 ||
    !kontenPenilaian;

  return (
    <>
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal menyimpan data bobot."
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Card title="Ubah Data Bobot">
          {existingPercentages >= 100 && (
            <div className="mb-3">
              <Alert
                type="warning"
                message="Total persentase sudah 100%. Anda tidak dapat menambahkan atau mengubah data sehingga melebihi 100%."
              />
            </div>
          )}
          <div className="mb-3">
            <Input
              type="text"
              name="kontenPenilaian"
              label="Konten Penilaian"
              isRequired
              value={kontenPenilaian}
              onChange={handleInputChange}
              errorMessage={errors.kontenPenilaian}
              disabled={existingPercentages >= 100}
            />
          </div>
          <div className="mb-3">
            <Input
              type="number"
              name="percent"
              label="Presentase (%)"
              isRequired
              value={percent}
              onChange={handleInputChange}
              errorMessage={errors.percent}
              min="0"
              max="100"
              disabled={existingPercentages >= 100}
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
            disabled={isDisabled}
          />
        </div>
      </form>
    </>
  );
}
