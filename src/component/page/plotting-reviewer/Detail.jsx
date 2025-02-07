import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
const formatRupiah = (angka) => {
  return `Rp. ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(angka)}`;
};

export default function MasterReviewerEdit({ onChangePage, withID }) {
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const username = JSON.parse(decryptId(Cookies.get("activeUser"))).username;
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    judulProposal: "",
    namaReviewer: "",
    Status: "",
    abstrakProposal: "",
    keywordProposal: "",
    skemaPengabdian: "",
    rumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
    totalDana: "",
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
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "PlottingReviewer/GetDataPlottingProposalReviewerDetail",
          {
            plo_id: withID,
          }
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

  const handleTerimaPlottingReviewer = async (e) => {
    e.preventDefault();
    try {
      const confirmation = await SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin menerima menjadi reviewer?",
        "warning",
        (confirm = "Ya")
      );

      if (confirmation) {
        const data = await UseFetch(
          API_LINK +
            "PlottingReviewer/SentTerimaPlottingProposalReviewerDetail",
          {
            plo_id: withID,
          }
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data reviewer.");
        } else {
          SweetAlert("Di Terima", "Sebagai Plotting Reviewer", "success");
          onChangePage("index");
        }
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

  // const handleTerimaPlottingReviewer = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const data = await UseFetch(
  //       API_LINK + "PlottingReviewer/SentTerimaPlottingProposalReviewerDetail",
  //       {
  //         plo_id: withID,
  //       }
  //     );
  //     if (data === "ERROR") {
  //       throw new Error("Terjadi kesalahan: Gagal mengambil data reviewer.");
  //     } else {
  //       SweetAlert("Sukses", "Plotting Reviewer menerima proposal", "success");
  //       onChangePage("index");
  //     }
  //   } catch (error) {
  //     window.scrollTo(0, 0);
  //     setIsError((prevError) => ({
  //       ...prevError,
  //       error: true,
  //       message: error.message,
  //     }));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleTolakPlottingReviewer = async (e) => {
    e.preventDefault();
    try {
      const confirmation = await SweetAlert(
        "Konfirmasi",
        "Apakah Anda yakin ingin menolak menjadi reviewer?",
        "warning",
        (confirm = "Ya")
      );

      if (confirmation) {
        const data = await UseFetch(
          API_LINK + "PlottingReviewer/SentTolakPlottingProposalReviewerDetail",
          {
            plo_id: withID,
          }
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data reviewer.");
        } else {
          SweetAlert(
            "Di Tolak",
            "Plotting Reviewer menolak proposal",
            "success"
          );
          onChangePage("index");
        }
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

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card-body p-3">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-header bg-secondary-subtle fw-bold">
                Data Plotting Reviewer
              </div>
              <div className="card-body p-4">
                <div className="row gy-4">
                  {/* Judul Proposal dan Nama Reviewer */}
                  <div className="col-lg-3">
                    <Label
                      forLabel="judulProposal"
                      title="Judul Proposal"
                      data={formDataRef.current.judulProposal}
                    />
                  </div>
                  <div className="col-lg-3">
                    <Label
                      forLabel="namaReviewer"
                      title="Nama Reviewer"
                      data={formDataRef.current.namaReviewer}
                    />
                  </div>

                  {/* Baris Informasi Lainnya */}
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

                {/* Aksi untuk Role ROL53 */}
                {role === "ROL53" &&
                  formDataRef.current.Status !== "Diterima Reviewer" &&
                  formDataRef.current.Status !== "Ditolak Reviewer" && (
                    <div className="d-flex justify-content-end mt-4">
                      <Button
                        type="button"
                        classType="danger me-2 px-4 py-2"
                        label="Tolak Menjadi Reviewer"
                        onClick={handleTolakPlottingReviewer}
                      />
                      <Button
                        type="button"
                        classType="primary px-4 py-2"
                        label="Terima Menjadi Reviewer"
                        onClick={handleTerimaPlottingReviewer}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Kembali */}
        <div className="d-flex justify-content-start mt-4">
          <Button
            type="button"
            classType="secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
        </div>
      </div>
    </>
  );
}
