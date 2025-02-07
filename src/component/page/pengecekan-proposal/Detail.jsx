import "../../util/RadioButton.css";
import { useEffect, useRef, useState } from "react";
import { object, string, date } from "yup";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { formatDate } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Table from "../../part/Table";
import Input from "../../part/Input";
import RadioButton from "../../part/RadioButton";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
import Modal from "../../part/Modal";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
// Fungsi untuk format rupiah dengan titik pemisah ribuan dan simbol Rp.
const formatRupiah = (angka) => {
  return `Rp. ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(angka)}`;
};

const inisialisasiDataKaryawan = [
  {
    Key: null,
    No: null,
    "Nama Karyawan": null,
    "Jabatan Terstruktur": null,
    Prodi: null,
    Deskripsi: null,
    Status: null,
    Count: 0,
  },
];

const inisialisasiDataMahasiswa = [
  {
    Key: null,
    Key2: null,
    No: null,
    Nim: null,
    "Nama Mahasiswa": null,
    Prodi: null,
    Count: 0,
  },
];
const inisialisasiDataBobotNilai = [
  {
    Key: null,
    No: null,
    "Konten Penilaian": null,
    "Persentase (%)": null,
    "Nilai Awal": null,
    "Nilai Akhir": null,
    Count: 0,
  },
];

export default function ProsesPengecekanProposalDetail({
  onChangePage,
  withID,
}) {
  const [errors, setErrors] = useState({});
  const username = JSON.parse(decryptId(Cookies.get("activeUser"))).username;
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [dataMahasiswa, setDataMahasiswa] = useState(inisialisasiDataMahasiswa);
  const [dataKaryawan, setDataKaryawan] = useState(inisialisasiDataKaryawan);
  const [dataBobotNilai, setDataBobotNilai] = useState(
    inisialisasiDataBobotNilai
  );
  const [dataKaryawanKonfirmasi, setDataKaryawanKonfirmasi] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");

  const formDataRef = useRef({
    idProposal: "",
    nomorProposal: "",
    rumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
    skemaPengabdian: "",
    judulProposal: "",
    abstrakProposal: "",
    keywordProposal: "",
    totalDana: "",
    dokumenProposal: "",
    komentarProposal: "",
    nilaiProposal: "",
    statusProposal: "",
    konfirmasiProposal: "",
    dibuatOleh: "",
    tanggalDibuat: "",
    diubahOleh: "",
    tanggalDiubah: "",
    komentarReviewer: "",
  });
  const modalRef = useRef();
  const radioRef = useRef();

  const userSchema = object({
    komentarProposal: string().required("harus dipilih"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data1 = await UseFetch(
          API_LINK + "PengajuanProposal/DetailPengajuanProposal",
          { id: withID }
        );

        if (data1 === "ERROR" || data1.length === 0) {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil data permintaan pelanggan."
          );
        } else {
          formDataRef.current = { ...formDataRef.current, ...data1[0] };
          if (formDataRef.current.komentarProposal === "-") {
            formDataRef.current.komentarProposal = "";
          }
        }

        const data2 = await UseFetch(
          API_LINK + "PengajuanProposal/DetailPengajuanProposalMahasiswa",
          { id: withID }
        );

        if (data2 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar permintaan produk."
          );
        } else if (data2.length === 0) {
          setDataMahasiswa(inisialisasiDataMahasiswa);
        } else {
          const formattedData = data2.map((value) => ({
            ...value,
            Alignment: ["center", "center", "left", "center", "center"],
          }));
          setDataMahasiswa(formattedData);
        }

        const data3 = await UseFetch(
          API_LINK + "PengajuanProposal/DetailPengajuanProposalKaryawan",
          { id: withID }
        );

        if (data3 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar permintaan produk."
          );
        } else if (data3.length === 0) {
          setDataKaryawan(inisialisasiDataKaryawan);
        } else {
          const formattedData = data3.map((value) => ({
            ...value,
            Alignment: [
              "center",
              "left",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));
          setDataKaryawan(formattedData);
        }

        const data4 = await UseFetch(
          API_LINK + "ReviewProposal/GetDataBobotPenilaianProposalById",
          { id: withID }
        );

        if (data4 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar permintaan produk."
          );
        } else if (data4.length === 0) {
          setDataBobotNilai(inisialisasiDataBobotNilai);
        } else {
          const formattedData = data4.map((value) => ({
            ...value,
            Alignment: ["center", "center", "center", "center", "center"],
          }));
          console.log(formattedData);
          setDataBobotNilai(formattedData);
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleConfirmCekProposal = async (e) => {
    e.preventDefault();
    if (!selectedValue) {
      setErrors((prev) => ({
        ...prev,
        konfirmasiProposal: "Pilih opsi.",
      }));
      return;
    }

    if (
      formDataRef.current.komentarProposal === "-" ||
      formDataRef.current.komentarProposal === ""
    ) {
      setErrors((prev) => ({
        ...prev,
        komentarProposal: "Komentar wajib diisi.",
      }));
      return;
    }

    formDataRef.current.konfirmasiProposal = selectedValue;
    try {
      setIsLoading(true);
      if (formDataRef.current.statusProposal === "Diajukan") {
        const data = await UseFetch(
          API_LINK + "PengecekanProposal/KonfirmasiPengecekanDraftProposal",
          {
            idProposal: withID,
            komentarProposal: formDataRef.current.komentarProposal,
            konfirmasiProposal: formDataRef.current.konfirmasiProposal,
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pengajuan proposal."
          );
        } else {
          SweetAlert(
            "Sukses",
            "Pengecekan proposal berhasil disimpan",
            "success"
          );
        }
      } else {
        const data = await UseFetch(
          API_LINK + "PengecekanProposal/KonfirmasiPengecekanDraftProposal",
          {
            idProposal: withID,
            komentarProposal: formDataRef.current.komentarProposal,
            konfirmasiProposal:
              formDataRef.current.konfirmasiProposal === "Diterima Admin"
                ? "Revisi diterima Admin"
                : "Revisi ditolak Admin",
          }
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pengajuan proposal."
          );
        } else {
          formDataRef.current.konfirmasiProposal =
            formDataRef.current.konfirmasiProposal === "Diterima Admin"
              ? "Revisi diterima Admin"
              : "Revisi ditolak Admin";
          SweetAlert(
            "Sukses",
            "Pengecekan proposal berhasil disimpan",
            "success"
          );
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

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    setErrors((prev) => ({ ...prev, konfirmasiProposal: null })); // Reset error
    //formDataRef.current.konfirmasiProposal = e.target.value;
  };

  function handleOpenModal(id) {
    modalRef.current.open();
  }

  const isUserConfirmed =
    (formDataRef.current.komentarProposal === "-" &&
      formDataRef.current.konfirmasiProposal === "") ||
    formDataRef.current.statusProposal === "Diajukan";

  const isStatusConfirmed = formDataRef.current.statusProposal === "Diajukan";

  const isUserConfirmedCek =
    formDataRef.current.statusProposal === "Diajukan" ||
    formDataRef.current.statusProposal === "Pengecekan Revisi";

  const isDataInitialized =
    JSON.stringify(dataBobotNilai) !==
    JSON.stringify(inisialisasiDataBobotNilai);
  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <Modal
        title="Form Proses Pengecekan Proposal"
        size="small"
        ref={modalRef}
        Button1={
          <Button
            label="Simpan"
            classType="primary me-2 px-4"
            onClick={handleConfirmCekProposal}
          />
        }
      >
        <div className="row">
          <div className="col-lg-8">
            <label className="form-label fw-bold">
              Apakah Proposal ini sudah sesuai? *
            </label>
          </div>
          <div className="col-lg-5">
            <RadioButton
              ref={radioRef}
              label=""
              name="konfirmasiProposal"
              arrData={[
                { Value: "Diterima Admin", Text: "Diterima" },
                { Value: "Ditolak Admin", Text: "Ditolak" },
              ]}
              isRequired={true}
              value={selectedValue}
              onChange={handleChange}
              errorMessage={errors.konfirmasiProposal}
              hideLabel={true}
            />
          </div>
          <div className="col-lg-full">
            <Input
              type="textarea"
              forInput="komentarProposal"
              label="Komentar"
              isRequired
              value={formDataRef.current.komentarProposal}
              onChange={handleInputChange}
              errorMessage={errors.komentarProposal}
            />
          </div>
        </div>
      </Modal>

      <div className="card">
        <div className="card-header bg-secondary-subtle fw-bold text-black">
          Detail Pengajuan Proposal
        </div>
        <div className="card-body p-3">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header bg-secondary-subtle fw-bold">
                  Data Pengajuan Proposal
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-3">
                      <Label
                        forLabel="nomorProposal"
                        title="Nomor Proposal"
                        data={formDataRef.current.nomorProposal}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="judulProposal"
                        title="Judul Proposal"
                        data={formDataRef.current.judulProposal}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="tanggalDibuat"
                        title="Tanggal Dibuat"
                        data={formatDate(
                          formDataRef.current.tanggalDibuat,
                          true
                        )}
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
                    <div className="col-lg-3">
                      <Label
                        forLabel="dokumenProposal"
                        title="Dokumen Prosal"
                        data={
                          formDataRef.current.dokumenProposal.replace(
                            "-",
                            ""
                          ) === "" ? (
                            "-"
                          ) : (
                            <a
                              href={
                                FILE_LINK + formDataRef.current.dokumenProposal
                              }
                              className="text-decoration-none"
                              target="_blank"
                            >
                              Unduh berkas
                            </a>
                          )
                        }
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
                      {!isUserConfirmed && (
                        <Label
                          forLabel="komentarProposal"
                          title="Komentar Proposal"
                          data={formDataRef.current.komentarProposal}
                        />
                      )}
                    </div>
                    <div className="col-lg-3">
                      {isStatusConfirmed && (
                        <Label
                        // forLabel="konfirmasiProposal"
                        // title="Status"
                        // data={formDataRef.current.konfirmasiProposal}
                        />
                      )}
                      {!isStatusConfirmed && (
                        <Label
                          forLabel="statusProposal"
                          title="Status"
                          data={formDataRef.current.statusProposal}
                        />
                      )}
                    </div>
                    <div className="col-lg-3">
                      {!isStatusConfirmed && (
                        <Label
                          forLabel="nilaiProposal"
                          title="Nilai Proposal"
                          data={formDataRef.current.nilaiProposal}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card mt-3">
                <div className="card-header bg-secondary-subtle fw-bold">
                  Daftar Mahasiswa
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                        Segala diskusi terkait persetujuan atau penolakan
                        terhadap permintaan mahasiswa ini dilakukan di luar
                        sistem. Sistem hanya menerima keputusan yang bersifat
                        final.
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <Table data={dataMahasiswa} JumlahData={true} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card mt-3">
                <div className="card-header bg-secondary-subtle fw-bold">
                  Daftar Karyawan
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-12">
                      {/* <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                        Segala diskusi terkait persetujuan atau penolakan
                        terhadap permintaan karyawan ini dilakukan di luar
                        sistem. Sistem hanya menerima keputusan yang bersifat
                        final.
                      </div> */}
                    </div>
                    <div className="col-lg-12">
                      <Table data={dataKaryawan} JumlahData={true} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isDataInitialized && (
              <div className="col-lg-12">
                <div className="card mt-3">
                  <div className="card-header bg-secondary-subtle fw-bold">
                    Rincian Penilaian
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                          {"Komentar Reviewer : " +
                            formDataRef.current.komentarReviewer}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <Table
                          data={dataBobotNilai}
                          JumlahData={true}
                          nilai={formDataRef.current.nilaiProposal}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-start my-4">
        <Button
          classType="secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("index")}
        />
        {isUserConfirmedCek && (
          <Button
            type="submit"
            classType="primary px-4 py-2"
            label="Cek Proposal"
            onClick={() => handleOpenModal(withID)}
          />
        )}
      </div>
    </>
  );
}
