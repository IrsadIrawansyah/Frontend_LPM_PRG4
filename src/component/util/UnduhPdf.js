import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const unduhPdf = (data, fileName = "Laporan_Proposal.pdf") => {
  const doc = new jsPDF();

  // Judul dokumen
  doc.setFontSize(16);
  doc.text("Laporan Proposal", 10, 10);

  // Header tabel
  const headers = [
    [
      "No",
      "No. Proposal",
      "Judul Proposal",
      "Skema Pengabdian",
      "Ketua Pengusul",
      "Total Dana",
      "Tanggal Kirim",
      "Status",
    ],
  ];

  // Data tabel
  const body = data.map((item) => [
    item.No,
    item["No. Proposal"],
    item["Judul Proposal"],
    item["Skema Pengabdian"],
    item["Ketua Pengusul"],
    item["Total Dana"],
    item["Tanggal Kirim"],
    item.Status,
  ]);

  // Tambahkan tabel ke PDF
  doc.autoTable({
    head: headers,
    body: body,
    startY: 20, // Mulai dari posisi Y = 20
  });

  // Simpan dokumen sebagai PDF
  doc.save(fileName);
};
