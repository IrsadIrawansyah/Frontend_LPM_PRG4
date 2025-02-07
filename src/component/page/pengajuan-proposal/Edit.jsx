import { useEffect, useRef, useState } from "react";
import React from "react";
import { object, string, date } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import Table from "../../part/Table";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import Card from "../../part/Card";
import Autocomplete from "../../part/AutoComplete";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";

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

export default function PengajuanProposalAdd({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listSkemaPengabdian, setListSkemaPengabdian] = useState({});
  const [listRumpunIlmu, setListRumpunIlmu] = useState({});
  const [listPohonIlmu, setListPohonIlmu] = useState({});
  const [listCabangIlmu, setListCabangIlmu] = useState({});
  const [dataMahasiswa, setDataMahasiswa] = useState(inisialisasiDataMahasiswa);
  const [dataKaryawan, setDataKaryawan] = useState(inisialisasiDataKaryawan);
  const [formattedValues, setFormattedValues] = React.useState({
    totalDana: "",
  });

  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const formDataRef = useRef({
    idProposal: "",
    nomorProposal: "",
    judulProposal: "",
    abstrakProposal: "",
    keywordProposal: "",
    skemaPengabdian: "",
    rumpunIlmu: "",
    pohonIlmu: "",
    cabangIlmu: "",
    totalDana: "",
    dokumenProposal: "",
    statusProposal: "",
  });

  const mahasiswa = {};
  const karyawan = {};

  const fileDokumenProposalRef = useRef(null);
  const prodiRef = useRef({
    kon_id: "",
    pro_id: "",
    pro_nama: "",
  });
  const jabatanTerstrukturRef = useRef({
    str_id: "",
    str_desc: "",
  });
  const namaMahasiswaRef = useRef(null);
  const namaKaryawanRef = useRef(null);

  const userSchema = object({
    idProposal: string(),
    nomorProposal: string(),
    judulProposal: string()
      .max(300, "maksimum 300 karakter")
      .required("harus diisi"),
    abstrakProposal: string()
      .max(500, "maksimum 500 karakter")
      .required("harus diisi"),
    keywordProposal: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    skemaPengabdian: string().required("harus dipilih"),
    rumpunIlmu: string().required("harus dipilih"),
    pohonIlmu: string().required("harus dipilih"),
    cabangIlmu: string().required("harus dipilih"),
    totalDana: string().required("Total dana harus diisi"),
    dokumenProposal: string().required("Dokumen proposal harus diunggah"),
    statusProposal: string(),
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

  // MENGAMBIL DAFTAR CABANG ILMU -- BEGIN
  useEffect(() => {
    if (formDataRef.current["cabangIlmu"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListDataCabangIlmu",
        {
          rumpun: formDataRef.current["rumpunIlmu"],
          pohon: formDataRef.current["pohonIlmu"],
          cabang: formDataRef.current["cabangIlmu"],
        },
        setListCabangIlmu,
        "Terjadi kesalahan: Gagal mengambil daftar cabang ilmu."
      );
    }
  }, [formDataRef.current["cabangIlmu"]]);
  // MENGAMBIL DAFTAR CABANG ILMU -- END

  // MENGAMBIL DAFTAR SKEMA PENGABDIAN -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "MasterSkemaPengabdian/GetListDataSkemaPengabdian",
      {},
      setListSkemaPengabdian,
      "Terjadi kesalahan: Gagal mengambil skema pengabdian."
    );
  }, []);
  // MENGAMBIL DAFTAR SKEMA PENGABDIAN -- END

  // MENGAMBIL DAFTAR RUMPUN ILMU -- BEGIN
  useEffect(() => {
    fetchDataByEndpointAndParams(
      API_LINK + "Utilities/GetListDataRumpunIlmu",
      {},
      setListRumpunIlmu,
      "Terjadi kesalahan: Gagal mengambil daftar provinsi."
    );
  }, []);
  // MENGAMBIL DAFTAR RUMPUN ILMU -- END

  // MENGAMBIL DAFTAR POHON ILMU -- BEGIN
  useEffect(() => {
    if (formDataRef.current["rumpunIlmu"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListDataPohonIlmu",
        { rumpun: formDataRef.current["rumpunIlmu"] },
        setListPohonIlmu,
        "Terjadi kesalahan: Gagal mengambil daftar kabupaten/kota."
      );
      setListCabangIlmu({});
    }
  }, [formDataRef.current["rumpunIlmu"]]);
  // MENGAMBIL DAFTAR POHON ILMU -- END

  useEffect(() => {
    if (formDataRef.current["pohonIlmu"]) {
      fetchDataByEndpointAndParams(
        API_LINK + "Utilities/GetListDataCabangIlmu",
        {
          rumpun: formDataRef.current["rumpunIlmu"],
          pohon: formDataRef.current["pohonIlmu"],
        },
        setListCabangIlmu,
        "Terjadi kesalahan: Gagal mengambil daftar kecamatan."
      );
    }
  }, [formDataRef.current["pohonIlmu"]]);

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        await handleLoadDetailPengajuanProposal();
        await handleLoadDetailMahasiswaPengajuanProposal();
        await handleLoadDetailKaryawanPengajuanProposal();
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

    // Cek jika inputan adalah "totalDana" dan format sebagai rupiah
    let formattedValue = value;
    if (name === "totalDana") {
      // Hapus semua karakter selain angka
      const rawValue = value.replace(/[^0-9]/g, "");

      // Format angka menjadi format rupiah
      formattedValue = new Intl.NumberFormat("id-ID").format(rawValue);

      // Simpan nilai mentah tanpa format ke ref untuk validasi dan submit
      formDataRef.current[name] = rawValue;
    } else {
      formDataRef.current[name] = value;
    }

    // Simpan nilai terformat ke state untuk tampilan
    setFormattedValues((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Validasi input sesuai schema
    const validationError = validateInput(
      name,
      formDataRef.current[name],
      userSchema
    );

    // Set error jika ada
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) {
      error = "berkas terlalu besar";
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "format berkas tidak valid";
    } else {
      formDataRef.current["dokumenProposal"] = file;
    }

    if (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [validationError.name]: error,
      }));
      ref.current.value = "";
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Validasi jumlah dataMahasiswa dan dataKaryawan
    if (dataMahasiswa.length < 1) {
      SweetAlert(
        "Yuk, jangan lupa!",
        "Minimal pilih satu mahasiswa dulu, ya!",
        "warning"
      );
      return;
    }

    if (dataKaryawan.length < 2) {
      SweetAlert(
        "Eh, kurang nih!",
        "Minimal pilih dua karyawan biar lengkap, yuk tambahin lagi!",
        "warning"
      );
      return;
    }

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

      const fileInputs = [
        { ref: fileDokumenProposalRef, key: "dokumenProposal" },
      ];

      fileInputs.forEach((fileInput) => {
        if (fileInput.ref.current.files.length > 0) {
          uploadPromises.push(
            UploadFile(fileInput.ref.current).then(
              (data) => (formDataRef.current[fileInput.key] = data.Hasil)
            )
          );
        }
      });

      try {
        await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "PengajuanProposal/EditPengajuanProposal",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan data pengajuan proposal."
          );
        } else {
          const currentID = data[0].hasil;
          await Promise.all(
            dataMahasiswa.map(async (mahasiswa) => {
              if (mahasiswa.Key) {
                const { Key, Key2 } = mahasiswa;
                const mahasiswaToSent = {
                  ID: currentID,
                  Key,
                  Key2,
                };
                const produkHasil = await UseFetch(
                  API_LINK +
                    "PengajuanProposal/CreatePengajuanProposalMahasiswaDetail",
                  mahasiswaToSent
                );
                if (produkHasil === "ERROR") {
                  throw new Error(
                    "Terjadi kesalahan: Gagal menyimpan data produk."
                  );
                }
              }
            })
          );

          await Promise.all(
            dataKaryawan.map(async (karyawan) => {
              if (karyawan.Key) {
                const { Key, Deskripsi, Status } = karyawan;
                const karyawanToSent = {
                  ID: currentID,
                  Key,
                  Deskripsi,
                  Status,
                };
                const produkHasil = await UseFetch(
                  API_LINK +
                    "PengajuanProposal/CreatePengajuanProposalKaryawanDetail",
                  karyawanToSent
                );
                if (produkHasil === "ERROR") {
                  throw new Error(
                    "Terjadi kesalahan: Gagal menyimpan data produk."
                  );
                }
              }
            })
          );

          SweetAlert(
            "Sukses",
            "Update Pengajuan proposal berhasil disimpan",
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
    } else window.scrollTo(0, 0);
  };

  async function handleLoadDetailPengajuanProposal() {
    const data = await UseFetch(
      API_LINK + "PengajuanProposal/GetDataPengajuanProposalById",
      { id: withID }
    );

    if (data === "ERROR" || data.length === 0) {
      throw new Error(
        "Terjadi kesalahan: Gagal mengambil data pengajuan proposal."
      );
    } else {
      const formatRupiah = (value) => {
        return new Intl.NumberFormat("id-ID").format(value);
      };

      formDataRef.current = { ...formDataRef.current, ...data[0] };
      // Mengatur nilai dengan format rupiah
      setFormattedValues((prevValues) => ({
        ...prevValues,
        totalDana: formatRupiah(data[0].totalDana), // Memformat angka menjadi format rupiah
      }));
    }
  }

  async function handleLoadDetailMahasiswaPengajuanProposal() {
    const data = await UseFetch(
      API_LINK + "PengajuanProposal/GetDataMahasiswaPengajuanProposalById",
      { id: withID }
    );

    if (data === "ERROR" || data.length === 0) {
      throw new Error(
        "Terjadi kesalahan: Gagal mengambil data Mahasiswa pengajuan proposal."
      );
    } else {
      const formattedData = data.map((value) => ({
        ...value,
        Aksi: ["Delete"],
        Alignment: ["center", "center", "left", "center", "center"],
      }));
      setDataMahasiswa(formattedData);
    }
  }

  async function handleLoadDetailKaryawanPengajuanProposal() {
    const data = await UseFetch(
      API_LINK + "PengajuanProposal/GetDataKaryawanPengajuanProposalById",
      { id: withID }
    );

    if (data === "ERROR" || data.length === 0) {
      throw new Error(
        "Terjadi kesalahan: Gagal mengambil data Karyawan pengajuan proposal."
      );
    } else {
      const formattedData = data.map((value) => {
        let aksi = [];
        if (
          formDataRef.current.statusProposal === "Draft" &&
          value.Deskripsi !== "Ketua"
        ) {
          aksi = ["Delete"];
        } else {
          aksi = [];
        }

        return {
          ...value,
          Aksi: aksi,
          Alignment: [
            "center",
            "left",
            "center",
            "center",
            "center",
            "center",
            "center",
          ],
        };
      });

      setDataKaryawan(formattedData);
    }
  }

  const fetchDataMahasiswaByProdi = async (withID) => {
    try {
      // Ambil data skema pengabdian untuk ID yang sedang diedit
      const dataById = await UseFetch(
        API_LINK + "PengajuanProposal/GetDataMahasiswaProdiByNim",
        { id: withID }
      );

      if (dataById === "ERROR" || dataById.length === 0) {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil data skema pengabdian."
        );
      } else {
        prodiRef.current = dataById[0];
      }
    } catch (error) {
      setIsError({
        error: true,
        message: error.message,
      });
    }
  };

  const fetchDataJabatanTerstrukturByKaryawanId = async (withID) => {
    try {
      // Ambil data skema pengabdian untuk ID yang sedang diedit
      const dataById = await UseFetch(
        API_LINK + "PengajuanProposal/GetDataJabatanTerstrukturByKaryawanId",
        { id: withID }
      );

      if (dataById === "ERROR" || dataById.length === 0) {
        throw new Error(
          "Terjadi kesalahan: Gagal mengambil data skema pengabdian."
        );
      } else {
        jabatanTerstrukturRef.current = dataById[0];
      }
    } catch (error) {
      setIsError({
        error: true,
        message: error.message,
      });
    }
  };

  async function handleAddMahasiswa() {
    if (!mahasiswa.Value || mahasiswa.Value.trim() === "") {
      SweetAlert(
        "Oops!",
        "Yuk, pilih dulu Mahasiswa yang mau ditambahkan!",
        "warning"
      );
      return; // Hentikan eksekusi jika input kosong
    }

    const nimMahasiswa = mahasiswa.Value;
    const namaMahasiswa = mahasiswa.Text;

    await fetchDataMahasiswaByProdi(nimMahasiswa);
    const idKonsentrasi = prodiRef.current.kon_id;
    const prodiMahasiswa = prodiRef.current.pro_nama;
    // Reset input menggunakan ref
    namaMahasiswaRef.current.resetInput();

    const existingMahasiswaIndex = dataMahasiswa.findIndex(
      (item) => item.Key === nimMahasiswa
    );

    if (existingMahasiswaIndex !== -1) {
      SweetAlert("Warning", "Data Mahasiswa Sudah ada!", "warning");
    } else {
      const count =
        dataMahasiswa[0].Key === null ? 1 : dataMahasiswa.length + 1;
      const mahasiswaBaru = {
        Key: nimMahasiswa,
        Key2: idKonsentrasi,
        No: count,
        Nim: nimMahasiswa,
        "Nama Mahasiswa": namaMahasiswa,
        Prodi: prodiMahasiswa,
        Count: count,
        Aksi: ["Delete"],
        Alignment: ["center", "center", "left", "center", "center"],
      };

      setDataMahasiswa((prevData) => {
        if (prevData[0].Key === null) prevData = [];
        return [...prevData, mahasiswaBaru];
      });
    }
  }

  async function handleAddKaryawan() {
    if (!karyawan.Value || karyawan.Value.trim() === "") {
      SweetAlert(
        "Oops!",
        "Yuk, pilih dulu karyawan yang mau ditambahkan!",
        "warning"
      );
      return; // Hentikan eksekusi jika input kosong
    }

    if (dataKaryawan.length > 4) {
      SweetAlert(
        "Eh, kebanyakan nih!",
        "Maksimal cuma bisa 5 karyawan aja ya. Yuk, Hapus Dulu!",
        "warning"
      );
      return;
    }

    const idKaryawan = karyawan.Value;
    const namaKaryawan = karyawan.Text;
    await fetchDataJabatanTerstrukturByKaryawanId(idKaryawan);
    const jabatanTerstruktur = jabatanTerstrukturRef.current.namaStruktur;
    const prodiDosen = jabatanTerstrukturRef.current.namaProdi;
    // Reset input menggunakan ref
    namaKaryawanRef.current.resetInput();

    const existingProdukIndex = dataKaryawan.findIndex(
      (item) => item.Key === idKaryawan
    );

    if (existingProdukIndex !== -1) {
      SweetAlert("Warning", "Data Karyawan Sudah ada!", "warning");
    } else {
      const count = dataKaryawan[0].Key === null ? 1 : dataKaryawan.length + 1;
      const karyawanBaru = {
        Key: idKaryawan,
        No: count,
        "Nama Karyawan": namaKaryawan,
        "Jabatan Terstruktur": jabatanTerstruktur,
        Prodi: prodiDosen,
        Deskripsi: "Anggota Proposal",
        Status: "Belum Konfirmasi",
        Count: count,
        Aksi: ["Delete"],
        Alignment: [
          "center",
          "left",
          "center",
          "center",
          "center",
          "center",
          "center",
        ],
      };

      setDataKaryawan((prevData) => {
        if (prevData[0].Key === null) prevData = [];
        return [...prevData, karyawanBaru];
      });
    }
  }

  function handleDeleteMahasiswa(id) {
    setDataMahasiswa((prevData) => {
      const newData = prevData
        .filter((mahasiswa) => mahasiswa.Key !== id)
        .map((mahasiswa, idx) => {
          return { ...mahasiswa, No: idx + 1, Count: idx + 1 };
        });
      if (newData.length === 0) return inisialisasiDataMahasiswa;
      else return newData;
    });
  }
  function handleDeleteKaryawan(id) {
    setDataKaryawan((prevData) => {
      const newData = prevData
        .filter((karyawan) => karyawan.Key !== id)
        .map((karyawan, idx) => {
          return { ...karyawan, No: idx + 1, Count: idx + 1 };
        });
      if (newData.length === 0) return inisialisasiDataKaryawan;
      else return newData;
    });
  }

  const isUserConfirmedCek =
    formDataRef.current.statusProposal === "Direvisi Reviewer";

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}

      <form onSubmit={handleAdd}>
        {/* Form Utama */}
        <Card title="Ubah Pengajuan Proposal" className="mb-4">
          <div className="row">
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="judulProposal"
                label="Judul Proposal"
                isRequired
                value={formDataRef.current.judulProposal}
                onChange={handleInputChange}
                errorMessage={errors.judulProposal}
              />
            </div>
            <div className="col-lg-4">
              <Input
                type="textarea"
                forInput="abstrakProposal"
                label="Abstrak Proposal"
                isRequired
                value={formDataRef.current.abstrakProposal}
                onChange={handleInputChange}
                errorMessage={errors.abstrakProposal}
              />
            </div>
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="keywordProposal"
                label="Keyword Proposal"
                isRequired
                value={formDataRef.current.keywordProposal}
                onChange={handleInputChange}
                errorMessage={errors.keywordProposal}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-lg-3">
              <DropDown
                forInput="skemaPengabdian"
                label="Skema PKM"
                arrData={listSkemaPengabdian}
                isRequired
                value={formDataRef.current.skemaPengabdian}
                onChange={handleInputChange}
                errorMessage={errors.skemaPengabdian}
              />
            </div>
            <div className="col-lg-3">
              <DropDown
                forInput="rumpunIlmu"
                label="Rumpun Ilmu"
                arrData={listRumpunIlmu}
                isRequired
                value={formDataRef.current.rumpunIlmu}
                onChange={handleInputChange}
                errorMessage={errors.rumpunIlmu}
              />
            </div>
            <div className="col-lg-3">
              <DropDown
                forInput="pohonIlmu"
                label="Pohon Ilmu"
                arrData={listPohonIlmu}
                isRequired
                value={formDataRef.current.pohonIlmu}
                onChange={handleInputChange}
                errorMessage={errors.pohonIlmu}
              />
            </div>
            <div className="col-lg-3">
              <DropDown
                forInput="cabangIlmu"
                label="Cabang Ilmu"
                arrData={listCabangIlmu}
                isRequired
                value={formDataRef.current.cabangIlmu}
                onChange={handleInputChange}
                errorMessage={errors.cabangIlmu}
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-lg-4">
              <Input
                type="text"
                forInput="totalDana"
                label="Total Dana (Rp.)"
                isRequired
                value={formattedValues.totalDana}
                onChange={handleInputChange}
                errorMessage={errors.totalDana}
              />
            </div>
            <div className="col-lg-4">
              <FileUpload
                forInput="dokumenProposal"
                label="Dokumen Proposal (.pdf, .zip)"
                isRequired
                formatFile=".pdf,.zip"
                ref={fileDokumenProposalRef}
                onChange={() =>
                  handleFileChange(fileDokumenProposalRef, "jpg,png,pdf,zip")
                }
                errorMessage={errors.dokumenProposal}
                hasExisting={formDataRef.current.dokumenProposal}
              />
            </div>
          </div>
        </Card>
        <Card title="Data Mahasiswa" className="mb-4">
          <div className="row">
            <div className="col-lg-3">
              <Autocomplete
                ref={namaMahasiswaRef}
                placeholder="Cari Mahasiswa..."
                fetchData={async (query) => {
                  const params = { query };
                  const data = await UseFetch(
                    API_LINK + "Utilities/GetListDataMahasiswa",
                    params
                  );

                  // Filter data berdasarkan query
                  const filtered = data.filter((item) =>
                    item.Text.toLowerCase().includes(query.toLowerCase())
                  );

                  return filtered; // Return hasil filter
                }}
                onSelect={(item) => {
                  mahasiswa.Value = item.Value;
                  mahasiswa.Text = item.Text;
                }}
                renderLabel={(item) => item.Text} // Menggunakan properti Text dari respons API
              />
            </div>
            <div className="col-lg-2">
              <Button
                classType="success w-100"
                iconName="add"
                label="TAMBAH"
                onClick={handleAddMahasiswa}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-lg-12">
              <Table
                data={dataMahasiswa}
                onDelete={handleDeleteMahasiswa}
                JumlahData={true}
              />
            </div>
          </div>
        </Card>
        <Card title="Daftar Karyawan" className="mb-4">
          <div className="row">
            <div className="col-lg-3">
              {!isUserConfirmedCek && (
                <Autocomplete
                  ref={namaKaryawanRef}
                  placeholder="Cari Karyawan..."
                  fetchData={async (query) => {
                    const params = { query }; // Parameter pencarian
                    const data = await UseFetch(
                      API_LINK + "MasterKaryawan/GetListKaryawan",
                      params
                    );

                    // Filter data berdasarkan query
                    const filtered = data.filter((item) =>
                      item.Text.toLowerCase().includes(query.toLowerCase())
                    );

                    return filtered; // Return hasil filter
                  }}
                  onSelect={(item) => {
                    karyawan.Value = item.Value;
                    karyawan.Text = item.Text;
                  }}
                  renderLabel={(item) => item.Text} // Menggunakan properti Text dari respons API
                />
              )}
            </div>

            <div className="col-lg-2">
              {!isUserConfirmedCek && (
                <Button
                  classType="success w-100"
                  iconName="add"
                  label="TAMBAH"
                  onClick={handleAddKaryawan}
                />
              )}
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-lg-12">
              <Table
                data={dataKaryawan}
                onDelete={handleDeleteKaryawan}
                JumlahData={true}
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
            disabled={isLoading}
          />
        </div>
      </form>
    </>
  );
}
