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
  const [dataStandarNilai, setStandarNilai] = useState({});
  const [dataBobot, setDataBobot] = useState([]);
  const [bobotNilai, setBobotNilai] = useState("");

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

    // Tambahkan objek bobot baru untuk menampung nilai setiap bobot
    bobotPenilaian: {}, // Akan menyimpan nilai bobot berdasarkan indeks
    komentarReviewer: "",
  });
  const modalRef = useRef(null);

  const userSchema = (bobotPenilaian) => {
    if (typeof bobotPenilaian !== "object" || Array.isArray(bobotPenilaian)) {
      console.error("bobotPenilaian harus berupa object:", bobotPenilaian);
      return object({
        komentarProposal: string().required("Komentar wajib diisi"),
      });
    }

    const dynamicFields = Object.keys(bobotPenilaian).reduce((acc, key) => {
      acc[key] = string().required("Nilai wajib diisi");
      return acc;
    }, {});

    return object({
      ...dynamicFields,
      komentarProposal: string().required("Komentar wajib diisi"),
    });
  };

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
          if (formDataRef.current.komentarReviewer === "-") {
            formDataRef.current.komentarReviewer = "";
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
          setDataBobotNilai(formattedData);
        }

        const data5 = await UseFetch(
          API_LINK + "ReviewProposal/GetDataStandarNilaiNow"
        );

        if (data5 === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar permintaan produk."
          );
        } else if (data5.length === 0) {
          setStandarNilai({});
        } else {
          setStandarNilai(data5[0]);
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
    handleOpenModall();
  }, []);

  // Effect untuk memperbarui bobotPenilaian saat komponen pertama kali dirender
  useEffect(() => {
    // Pastikan dataBobot sudah ada
    if (dataBobot && dataBobot.length > 0) {
      // Update bobotPenilaian dengan nilai default berdasarkan dataBobot
      const bobotPenilaian = dataBobot.reduce((acc, item, index) => {
        acc[`nilaiProposal_${index}`] = ""; // Inisialisasi dengan string kosong
        return acc;
      }, {});

      // Perbarui formDataRef
      formDataRef.current.bobotPenilaian = bobotPenilaian;
    }
  }, [dataBobot]); // Dependensi untuk memicu ketika dataBobot berubah

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    try {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null, // Hapus error jika validasi berhasil
      }));
    } catch (validationError) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validationError.message, // Simpan pesan error
      }));
    }
    formDataRef.current[name] = value; // Update nilai pada ref
  };

  const handleInputChangeNilai = (
    e,
    index,
    percentBobot,
    kontenBobot,
    idBobot
  ) => {
    const { name, value } = e.target;

    // Menghitung nilai akhir
    const nilaiAwal = value || 0; // Nilai input yang diubah, default 0 jika kosong
    const nilaiAkhir = nilaiAwal * (percentBobot / 100); // Menghitung nilai akhir berdasarkan persentase
    // Update formDataRef.current dengan nilai baru
    formDataRef.current.bobotPenilaian[`idBobot_${index}`] = idBobot;
    formDataRef.current.bobotPenilaian[`kontenPenilaian_${index}`] =
      kontenBobot;
    formDataRef.current.bobotPenilaian[`persentase_${index}`] = percentBobot;
    formDataRef.current.bobotPenilaian[`nilaiProposal_${index}`] = nilaiAwal;
    formDataRef.current.bobotPenilaian[`nilaiAkhir_${index}`] = nilaiAkhir;

    // Validasi nilai, jika kosong set error
    if (!value.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`nilaiProposal_${index}`]: "Nilai wajib diisi",
      }));
    } else {
      setErrors((prevErrors) => {
        const { [`nilaiProposal_${index}`]: _, ...rest } = prevErrors;
        return rest; // Hapus error untuk field jika ada nilai
      });
    }
  };

  const generateBobotArray = () => {
    const { idProposal, bobotPenilaian } = formDataRef.current;
    const idStandarNilai = dataStandarNilai.IdStandarNilai;

    console.log(formDataRef.current);
    if (
      !idProposal ||
      !bobotPenilaian ||
      Object.keys(bobotPenilaian).length === 0
    ) {
      console.error("Data idProposal atau bobotPenilaian tidak lengkap.");
      return [];
    }

    // Cari jumlah indeks dari salah satu jenis field di bobotPenilaian
    const maxIndex = Math.max(
      ...Object.keys(bobotPenilaian)
        .filter((key) => key.startsWith("idBobot_"))
        .map((key) => parseInt(key.split("_")[1], 10))
    );

    // Buat array berdasarkan indeks yang ditemukan dan hitung total nilaiAkhir
    const bobotArray = [];
    let totalNilaiAkhir = 0; // Variabel untuk menyimpan total nilaiAkhir

    for (let i = 0; i <= maxIndex; i++) {
      const nilaiAkhirRaw = parseFloat(bobotPenilaian[`nilaiAkhir_${i}`]) || 0;
      const nilaiAkhir = parseFloat(nilaiAkhirRaw.toFixed(1)); // Membulatkan ke 1 angka di belakang koma
      totalNilaiAkhir += nilaiAkhir; // Tambahkan nilaiAkhir ke total
      bobotArray.push({
        idProposal,
        idStandarNilai,
        [`idBobot_${i}`]: bobotPenilaian[`idBobot_${i}`],
        [`kontenPenilaian_${i}`]: bobotPenilaian[`kontenPenilaian_${i}`],
        [`nilaiAkhir_${i}`]: nilaiAkhir,
        [`nilaiProposal_${i}`]: bobotPenilaian[`nilaiProposal_${i}`],
        [`persentase_${i}`]: bobotPenilaian[`persentase_${i}`],
      });
    }
    totalNilaiAkhir = Math.round(totalNilaiAkhir); // Pembulatan ke bilangan bulat terdekat
    // Set nilaiProposal dengan total nilaiAkhir yang dihitung
    formDataRef.current.nilaiProposal = totalNilaiAkhir;

    return bobotArray;
  };

  const handleSimpanBobotNilai = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    // Memeriksa apakah bobotPenilaian kosong
    if (Object.keys(formDataRef.current.bobotPenilaian).length === 0) {
      validationErrors.bobotPenilaian = "Bobot penilaian tidak boleh kosong";
    } else {
      // Loop untuk validasi tiap field dalam bobotPenilaian
      for (const [key, value] of Object.entries(
        formDataRef.current.bobotPenilaian
      )) {
        // Memeriksa apakah nilai kosong atau tidak valid untuk setiap field
        if (key.startsWith("nilaiProposal_") || key.startsWith("nilaiAkhir_")) {
          // Pastikan value adalah string atau angka sebelum di-trim
          const valueToCheck =
            value !== undefined && value !== null ? value.toString() : "";

          if (valueToCheck.trim() === "") {
            validationErrors[key] = "Nilai wajib diisi";
          } else {
            // Validasi untuk memastikan nilai berada di antara 0 dan 100
            const numericValue = parseFloat(valueToCheck);
            if (isNaN(numericValue)) {
              validationErrors[key] = "Nilai harus berupa angka";
            } else if (numericValue < 0 || numericValue > 100) {
              validationErrors[key] = "Nilai harus di antara 0 dan 100";
            }
          }
        } else if (key.startsWith("idBobot_")) {
          // Untuk field idBobot, pastikan ada id yang valid
          if (!value) {
            validationErrors[key] = "ID Bobot wajib diisi";
          }
        }
      }
    }

    // Validasi komentarProposal
    if (
      !formDataRef.current.komentarReviewer ||
      formDataRef.current.komentarReviewer.trim() === ""
    ) {
      validationErrors.komentarReviewer = "Komentar wajib diisi";
    }

    // Cek apakah ada error yang ditemukan
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Update state dengan error
      return false; // Menandakan ada error
    }

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const bobotArray = generateBobotArray(); // Panggil fungsi untuk membuat array

        const data = await UseFetch(
          API_LINK + "ReviewProposal/CreateNilaiPengajuanProposalAndKomentar",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pengajuan proposal."
          );
        } else {
          console.log(data);
          await Promise.all(
            bobotArray.map(async (bobot, index) => {
              console.log("Jalan Awal ke- " + index);
              // Validasi jika idBobot tersedia
              if (bobot[`idBobot_${index}`]) {
                const bobotToSent = {
                  idBobot: bobot[`idBobot_${index}`],
                  idProposal: bobot.idProposal,
                  idStandarNilai: bobot.idStandarNilai,
                  kontenPenilaian: bobot[`kontenPenilaian_${index}`],
                  persentase: bobot[`persentase_${index}`],
                  nilaiAwal: bobot[`nilaiProposal_${index}`], // Menggunakan nilaiProposal jika sesuai
                  nilaiAkhir: bobot[`nilaiAkhir_${index}`],
                };
                try {
                  const produkHasil = await UseFetch(
                    API_LINK + "ReviewProposal/CreateDataBobotNilaiProposal",
                    bobotToSent
                  );
                  if (produkHasil === "ERROR") {
                    throw new Error(
                      `Terjadi kesalahan: Gagal menyimpan data produk untuk idBobot ${
                        bobot[`idBobot_${index}`]
                      }.`
                    );
                  } else {
                    console.log(produkHasil);
                    console.log("Jalan Akhir ke- " + index);
                  }
                } catch (error) {
                  console.error(error.message);
                  throw error; // Lempar error untuk menghentikan proses Promise.all jika terjadi kesalahan
                }
              }
            })
          );

          SweetAlert(
            "Sukses",
            "Penilaian Proposal berhasil disimpan",
            "success"
          );
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
    } else {
      SweetAlert("Gagal", "Tolong Lengkapi Field", "error");
    }
  };

  const handleOpenModall = async () => {
    try {
      setIsLoading(true);
      const data = await UseFetch(
        API_LINK + "ReviewProposal/GetDataBobotReviewerPenilaianProposal"
      );

      if (data === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal menyimpan data pengajuan proposal."
        );
      }
      if (data[0].Result === "Kelebihan" || data[0].Result === "Kekurangan") {
        setBobotNilai("Bobot Penilaian tidak sesuai. Hubungi Admin.");
        return; // Modal tidak akan dibuka
      }

      setDataBobot(data);
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

  function handleOpenModal(id) {
    if (bobotNilai === "Bobot Penilaian tidak sesuai. Hubungi Admin.") {
      SweetAlert(
        "Error",
        "Bobot Penilaian tidak sesuai. Hubungi Admin.",
        "error"
      );
    } else {
      modalRef.current.open();
    }
  }
  const isUserConfirmed =
    formDataRef.current.nilaiProposal === "-" &&
    formDataRef.current.komentarReviewer === "-";

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <Modal
        title="Form Penilaian"
        size="small"
        ref={modalRef}
        Button1={
          <Button
            label="Simpan"
            classType="primary me-2 px-4"
            onClick={handleSimpanBobotNilai}
          />
        }
      >
        <div className="row">
          <div className="col-lg-full">
            {dataBobot &&
              dataBobot.map((item, index) => (
                <div key={index} className="d-flex mb-3">
                  <div className="col-lg-6">
                    <Label
                      forLabel={`kontenBobot_${index}`}
                      title={`${item.kontenBobot} (${item.percentBobot}%)`}
                    />
                  </div>
                  <div className="col-lg-6">
                    <Input
                      type="number"
                      forInput={`nilaiProposal_${index}`}
                      isRequired
                      value={
                        formDataRef.current.bobotPenilaian[
                          `nilaiProposal_${index}`
                        ] || ""
                      }
                      onChange={(e) =>
                        handleInputChangeNilai(
                          e,
                          index,
                          item.percentBobot,
                          item.kontenBobot,
                          item.idBobot
                        )
                      }
                      errorMessage={errors[`nilaiProposal_${index}`]}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="col-lg-full">
            <Input
              type="textarea"
              forInput="komentarReviewer"
              label="Komentar"
              isRequired
              value={formDataRef.current.komentarReviewer}
              onChange={handleInputChange}
              errorMessage={errors.komentarReviewer}
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
                        title="Total Dana (Rp.)"
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
                      <Label
                        forLabel="komentarProposal"
                        title="Komentar Admin"
                        data={formDataRef.current.komentarProposal}
                      />
                    </div>
                    <div className="col-lg-3">
                      <Label
                        forLabel="konfirmasiProposal"
                        title="Status"
                        data={formDataRef.current.konfirmasiProposal}
                      />
                    </div>
                    <div className="col-lg-3">
                      {!isUserConfirmed && (
                        <Label
                          forLabel="nilaiProposal"
                          title="Nilai"
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
                      <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold">
                        Segala diskusi terkait persetujuan atau penolakan
                        terhadap permintaan karyawan ini dilakukan di luar
                        sistem. Sistem hanya menerima keputusan yang bersifat
                        final.
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <Table data={dataKaryawan} JumlahData={true} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card mt-3">
                <div className="card-header bg-secondary-subtle fw-bold">
                  Rincian Penilaian
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-lg-12">
                      {!isUserConfirmed && (
                        <div className="px-3 py-2 bg-info-subtle border-start border-5 border-info mb-3 fw-bold  text-wrap text-break">
                          {"Komentar Reviewer : " +
                            formDataRef.current.komentarReviewer}
                        </div>
                      )}
                    </div>
                    <div className="col-lg-12">
                      <Table
                        data={dataBobotNilai}
                        JumlahData={true}
                        nilai={formDataRef.current.nilaiProposal}
                      />
                    </div>
                  </div>
                  <span>
                    Notes: Nilai harus di atas Standar Nilai{" "}
                    {dataStandarNilai.StandarNilai}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-start my-4">
        <Button
          classType="secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("index")}
        />
        <Button
          type="submit"
          classType="primary px-4 py-2"
          label="Proses Penilaian"
          onClick={() => handleOpenModal()}
        />
      </div>
    </>
  );
}
