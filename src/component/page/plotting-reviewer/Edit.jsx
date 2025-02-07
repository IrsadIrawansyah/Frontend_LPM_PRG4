import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
const formatRupiah = (angka) => {
  return `Rp. ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(angka)}`;
};

export default function MasterReviewerEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // Menyimpan ID proposal
  const [listProposal, setListProposal] = useState({});
  const [listReviewer, setListReviewer] = useState({});
  const formDataRef = useRef({
    idPlottingReviewer: "",
    idProposal: "",
    idReviewer: "",
    judulProposal: "",
    namaReviewer: "",
    abstrakProposal: "",
    keywordProposal: "",
    skemaPengabdian: "",
    rumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
    totalDana: "",
  });

  const userSchema = object({
    idPlottingReviewer: string(),
    idProposal: string(),
    idReviewer: string().required("harus dipilih"),
    judulProposal: string(),
    namaReviewer: string().required("harus dipilih"),
    Status: string(),
    abstrakProposal: string(),
    keywordProposal: string(),
    skemaPengabdian: string(),
    rumpunIlmu: string(),
    pohonIlmu: string(),
    cabangIlmu: string(),
    totalDana: string(),
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
      API_LINK + "PlottingReviewer/GetListDataReviewerProposal",
      {},
      setListReviewer,
      "Terjadi kesalahan: Gagal mengambil daftar karyawan."
    );
  }, []);

  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "PlottingReviewer/GetListDataProposalPlottingReviewer",
      {},
      setListProposal,
      "Terjadi kesalahan: Gagal mengambil daftar karyawan."
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "PlottingReviewer/GetDataPlottingProposalReviewerDetail",
          { idReviewerPlotting: withID }
        );
        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data reviewer.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          const data1 = await UseFetch(
            API_LINK + "PengajuanProposal/DetailPengajuanProposal",
            {
              id: formDataRef.current.idProposal,
            }
          );

          if (data1 === "ERROR" || !data1) {
            throw new Error(
              "Terjadi kesalahan: Gagal mengambil data pengajuan proposal."
            );
          }
          formDataRef.current.judulProposal = data1[0].judulProposal || "";
          formDataRef.current.abstrakProposal = data1[0].abstrakProposal || "";
          formDataRef.current.keywordProposal = data1[0].keywordProposal || "";
          formDataRef.current.skemaPengabdian = data1[0].skemaPengabdian || "";
          formDataRef.current.rumpunIlmu = data1[0].rumpunIlmu || "";
          formDataRef.current.pohonIlmu = data1[0].pohonIlmu || "";
          formDataRef.current.cabangIlmu = data1[0].cabangIlmu || "";
          formDataRef.current.totalDana = data1[0].totalDana || 0;
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
    if (name === "judulProposal") {
      setSelectedId(e.target.value);
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  useEffect(() => {
    if (!selectedId) return; // Jika belum ada ID, jangan fetch data

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "PengajuanProposal/DetailPengajuanProposal",
          {
            id: selectedId,
          }
        );

        if (data === "ERROR" || !data) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data pengajuan proposal."
          );
        }
        formDataRef.current.abstrakProposal = data[0].abstrakProposal || "";
        formDataRef.current.keywordProposal = data[0].keywordProposal || "";
        formDataRef.current.skemaPengabdian = data[0].skemaPengabdian || "";
        formDataRef.current.rumpunIlmu = data[0].rumpunIlmu || "";
        formDataRef.current.pohonIlmu = data[0].pohonIlmu || "";
        formDataRef.current.cabangIlmu = data[0].cabangIlmu || "";
        formDataRef.current.totalDana = data[0].totalDana || 0;
      } catch (error) {
        setIsError(true);
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedId]);

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

      console.log("jalan");
      try {
        const data = await UseFetch(
          API_LINK + "PlottingReviewer/EditPlottingProposalReviewerDetail",
          formDataRef.current
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
        <Card title="Ubah Data Plotting Reviewer">
          <div className="col-lg-3">
            <DropDown
              forInput="idProposal"
              label="Ubah Judul Proposal"
              arrData={listProposal}
              value={formDataRef.current.idProposal}
              onChange={handleInputChange}
            />
          </div>
          <div className="row">
            <div className="col-lg-3">
              <Label
                forLabel="judulProposal"
                title="Judul Proposal"
                data={formDataRef.current.judulProposal}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="keywordProposal"
                title="Keyword Proposal"
                data={formDataRef.current.keywordProposal}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="abstrakProposal"
                title="Abstrak Proposal"
                data={formDataRef.current.abstrakProposal}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="skemaPengabdian"
                title="Skema Pengabdian"
                data={formDataRef.current.skemaPengabdian}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="rumpunIlmu"
                title="Rumpun Ilmu"
                data={formDataRef.current.rumpunIlmu}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="pohonIlmu"
                title="Pohon Ilmu"
                data={formDataRef.current.pohonIlmu}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="cabangIlmu"
                title="Cabang Ilmu"
                data={formDataRef.current.cabangIlmu}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="totalDana"
                title="Total Dana"
                data={formatRupiah(formDataRef.current.totalDana)}
              />
            </div>
          </div>
          <div className="col-lg-3">
            <DropDown
              forInput="idReviewer"
              label="Nama Karyawan"
              arrData={listReviewer}
              isRequired
              value={formDataRef.current.idReviewer}
              onChange={handleInputChange}
              errorMessage={errors.idReviewer}
            />
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
