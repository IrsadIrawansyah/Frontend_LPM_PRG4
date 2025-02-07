import * as XLSX from "xlsx";

export const unduhExcel = (data, fileName = "Laporan_Proposal.xlsx") => {
  // Header tabel
  const headers = [
    "No",
    "No. Proposal",
    "Judul Proposal",
    "Skema Pengabdian",
    "Ketua Pengusul",
    "Total Dana",
    "Tanggal Kirim",
    "Status",
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

  // Gabungkan header dan data
  const worksheetData = [headers, ...body];

  // Buat worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Buat workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Proposal");

  // Ekspor file Excel
  XLSX.writeFile(workbook, fileName);
};
