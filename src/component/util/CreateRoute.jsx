import { lazy } from "react";

const Dashboard = lazy(() => import("../page/dashboard/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
//LPPM PROPOSAL
const MasterBobot = lazy(() => import("../page/master-bobot/Root"));
const StandarNilai = lazy(() => import("../page/master-standar-nilai/Root"));
const RumpunIlmu = lazy(() => import("../page/master-rumpun-ilmu/Root"));
const SkemaPengabdian = lazy(() =>
  import("../page/master-skema-pengabdian/Root")
);
const TemplateDokumen = lazy(() =>
  import("../page/master-template-dokumen/Root")
);
const Informasi = lazy(() => import("../page/master-informasi/Root"));
const Reviewer = lazy(() => import("../page/master-reviewer/Root"));
const PengajuanProposal = lazy(() => import("../page/pengajuan-proposal/Root"));
const DaftarPengajuanProposal = lazy(() =>
  import("../page/daftar-pengajuan-proposal/Root")
);
const PengecekanProposal = lazy(() =>
  import("../page/pengecekan-proposal/Root")
);
const ReviewProposal = lazy(() => import("../page/review-proposal/Root"));
const DaftarReviewProposal = lazy(() =>
  import("../page/daftar-reviewer-proposal/Root")
);
const DaftarPengecekanProposal = lazy(() =>
  import("../page/daftar-pengecekan-proposal/Root")
);
const PlottingReviewer = lazy(() => import("../page/plotting-reviewer/Root"));
const PengajuanLaporanKemajuan = lazy(() =>
  import("../page/pengajuan-laporan-kemajuan/Root")
);
const PengajuanLaporanKemajuanReviewer = lazy(() =>
  import("../page/laporan-kemajuan-reviewer/Root")
);
const DaftarLaporanKemajuanReviewer = lazy(() =>
  import("../page/daftar-laporan-kemajuan-reviewer/Root")
);
const DaftarLaporanKemajuan = lazy(() =>
  import("../page/daftar-laporan-kemajuan/Root")
);
const PengajuanLaporanAkhir = lazy(() =>
  import("../page/pengajuan-laporan-akhir/Root")
);
const PengajuanLaporanAkhirReviewer = lazy(() =>
  import("../page/laporan-akhir-reviewer/Root")
);
const DaftarPengajuanLaporanAkhirReviewer = lazy(() =>
  import("../page/daftar-laporan-akhir-reviewer/Root")
);
const DaftarLaporanAkhir = lazy(() =>
  import("../page/daftar-laporan-akhir/Root")
);
const PengajuanPKM = lazy(() => import("../page/data-pkm/Root"));
const routeList = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/notifikasi",
    element: <Notifikasi />,
  },
  {
    path: "/master_bobot",
    element: <MasterBobot />,
  },
  {
    path: "/master_standar_nilai",
    element: <StandarNilai />,
  },
  {
    path: "/master_rumpun_ilmu",
    element: <RumpunIlmu />,
  },
  {
    path: "/master_skema_pkm",
    element: <SkemaPengabdian />,
  },
  {
    path: "/master_template_dokumen",
    element: <TemplateDokumen />,
  },
  {
    path: "/master_reviewer",
    element: <Reviewer />,
  },
  {
    path: "/informasi",
    element: <Informasi />,
  },
  {
    path: "/pengajuan_proposal",
    element: <PengajuanProposal />,
  },
  {
    path: "/daftar_pengajuan_proposal",
    element: <DaftarPengajuanProposal />,
  },
  {
    path: "/proses_pengecekan_proposal",
    element: <PengecekanProposal />,
  },
  {
    path: "/proses_review_proposal",
    element: <ReviewProposal />,
  },
  {
    path: "/daftar_review_proposal",
    element: <DaftarReviewProposal />,
  },
  {
    path: "/daftar_pengecekan_proposal",
    element: <DaftarPengecekanProposal />,
  },
  {
    path: "/plotting_reviewer",
    element: <PlottingReviewer />,
  },
  {
    path: "/proses_laporan_kemajuan",
    element: <PengajuanLaporanKemajuan />,
  },
  {
    path: "/proses_review_laporan_kemajuan",
    element: <PengajuanLaporanKemajuanReviewer />,
  },
  {
    path: "/proses_review_laporan_akhir",
    element: <PengajuanLaporanAkhirReviewer />,
  },
  {
    path: "/daftar_review_laporan_kemajuan",
    element: <DaftarLaporanKemajuanReviewer />,
  },
  {
    path: "/daftar_laporan_kemajuan",
    element: <DaftarLaporanKemajuan />,
  },
  {
    path: "/daftar_review_laporan_akhir",
    element: <DaftarPengajuanLaporanAkhirReviewer />,
  },
  {
    path: "/proses_laporan_akhir",
    element: <PengajuanLaporanAkhir />,
  },
  {
    path: "/daftar_laporan_akhir",
    element: <DaftarLaporanAkhir />,
  },
  {
    path: "/data_pkm",
    element: <PengajuanPKM />,
  },
];

export default routeList;
