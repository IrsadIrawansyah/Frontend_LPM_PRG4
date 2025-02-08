import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function downloadChartAsImage(chartId, format) {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    console.error(`Chart with ID ${chartId} not found.`);
    return;
  }

  html2canvas(chartElement).then((canvas) => {
    const link = document.createElement("a");
    if (format === "png" || format === "jpeg") {
      link.download = `chart.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    } else if (format === "pdf") {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
      });
      pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
      pdf.save("chart.pdf");
    }
  });
}

// Nama bulan untuk label
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Modern color scheme dengan gradien yang lebih menarik
const chartColors = {
  primary: {
    fill: [
      "rgba(37, 99, 235, 0.9)", // Biru lebih terang
      "rgba(29, 78, 216, 0.9)", // Biru medium
      "rgba(30, 58, 138, 0.9)", // Biru gelap
    ],
    stroke: "rgba(37, 99, 235, 1)",
    hover: "rgba(59, 130, 246, 0.95)",
  },
  grid: "rgba(37, 99, 235, 0.08)",
  text: "#1e40af",
  tooltip: {
    background: "rgba(255, 255, 255, 0.98)",
    border: "rgba(37, 99, 235, 0.2)",
    text: "#1e40af",
  },
};

// Opsi chart yang diperbarui dengan desain modern
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      align: "end",
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        color: chartColors.text,
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: chartColors.tooltip.background,
      titleColor: chartColors.tooltip.text,
      bodyColor: chartColors.tooltip.text,
      borderColor: chartColors.tooltip.border,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
      titleFont: {
        family: "'Barlow', sans-serif",
        size: 13,
        weight: "600",
      },
      bodyFont: {
        family: "'Barlow', sans-serif",
        size: 12,
        weight: "400",
      },
      callbacks: {
        label: function (context) {
          const value = context.raw;
          return ` Total: ${Math.round(value)} kegiatan`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: chartColors.grid,
        borderDash: [8, 4],
        drawBorder: false,
      },
      ticks: {
        color: chartColors.text,
        padding: 10,
        font: {
          family: "'Barlow', sans-serif",
          size: 11,
        },
        // Memastikan hanya menampilkan angka bulat
        stepSize: 1,
        callback: function (value) {
          if (Math.floor(value) === value) {
            return value;
          }
          return "";
        },
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: chartColors.text,
        padding: 10,
        font: {
          family: "'Barlow', sans-serif",
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
  },
  animation: {
    duration: 1500,
    easing: "easeInOutQuart",
    delay: (context) => {
      return context.dataIndex * 100;
    },
  },
  elements: {
    bar: {
      backgroundColor: function (context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;

        const gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        gradient.addColorStop(0, chartColors.primary.fill[0]);
        gradient.addColorStop(0.5, chartColors.primary.fill[1]);
        gradient.addColorStop(1, chartColors.primary.fill[2]);

        return gradient;
      },
      borderRadius: 8,
      borderSkipped: false,
    },
  },
  layout: {
    padding: {
      top: 20,
      right: 25,
      bottom: 20,
      left: 25,
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};

export default function DashboardIndex() {
  const [selectedYearMonth, setSelectedYearMonth] = useState(
    new Date().getFullYear()
  );
  const [selectedYearProdi, setSelectedYearProdi] = useState(
    new Date().getFullYear()
  );
  const [fromYear, setFromYear] = useState(2025);
  const [toYear, setToYear] = useState(2025);
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [chartData1, setChartData1] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);

  // -- Tambahan: Definisikan currentYear & years agar tidak error --
  const currentYear = new Date().getFullYear();
  let years = [];

  // Tetap gunakan potongan kode Anda (struktur tidak diubah)
  const futureYear = currentYear + 5; // misalnya 5 tahun ke depan
  for (let i = currentYear; i <= futureYear; i++) {
    years.push(i);
  }

  // Gunakan useEffect untuk mengisi state yearsAvailable satu kali di awal
  useEffect(() => {
    setYearsAvailable(years);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi dataset chart
  const createChartDataset = (label, data) => ({
    label: label,
    data: data,
    borderColor: chartColors.primary.stroke,
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false,
    barThickness: 32,
    maxBarThickness: 40,
    hoverBackgroundColor: chartColors.primary.hover,
    hoverBorderWidth: 2,
    transition: "all 0.3s ease",
  });

  // Ambil data untuk Chart 1 (Kegiatan Per Bulan)
  useEffect(() => {
    async function fetchData() {
      const currentFilter = { year: selectedYearMonth };
      const data = await UseFetch(
        API_LINK + "Dashboard/KegiatanPerBulan",
        currentFilter
      );

      const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
      const labels = allMonths.map((month) => monthNames[month - 1]);
      const values = allMonths.map((month) => {
        const dataForMonth = data.find((item) => item.Bulan === month);
        return dataForMonth ? Math.round(dataForMonth.TotalData) : 0;
      });

      setChartData1({
        labels: labels,
        datasets: [createChartDataset("Kegiatan per Bulan", values)],
      });
    }
    fetchData();
  }, [selectedYearMonth]);

  // Ambil data untuk Chart 2 (Kegiatan Per Tahun By Prodi)
  useEffect(() => {
    async function fetchData() {
      const currentFilter = { year: selectedYearProdi };
      const data = await UseFetch(
        API_LINK + "Dashboard/KegiatanPerTahunByProdi",
        currentFilter
      );

      const labels = data.map((item) => item.Prodi);
      const values = data.map((item) => Math.round(item.TotalKegiatan));

      setChartData2({
        labels: labels,
        datasets: [
          createChartDataset("Total Kegiatan Berdasarkan Prodi", values),
        ],
      });
    }
    fetchData();
  }, [selectedYearProdi]);

  // Ambil data untuk Chart 3 (Kegiatan Per Tahun)
  useEffect(() => {
    async function fetchData() {
      try {
        if (fromYear > toYear) {
          console.error("Rentang tahun tidak valid: fromYear > toYear");
          return;
        }

        const currentFilter = {
          fromYear,
          toYear,
        };

        const data = await UseFetch(
          API_LINK + "Dashboard/KegiatanPerTahun",
          currentFilter
        );

        const yearsRange = Array.from(
          { length: toYear - fromYear + 1 },
          (_, i) => fromYear + i
        );

        const labels = yearsRange.map((year) => `Tahun ${year}`);
        const values = yearsRange.map((year) => {
          const dataForYear = data.find((item) => item.Tahun === year);
          return dataForYear ? Math.round(dataForYear.TotalKegiatan) : 0;
        });

        setChartData3({
          labels: labels,
          datasets: [createChartDataset("Jumlah Kegiatan Tahunan", values)],
        });
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data:", error);
      }
    }
    fetchData();
  }, [fromYear, toYear]);

  // Opsi judul chart
  const commonTitleStyle = {
    display: true,
    color: chartColors.text,
    font: {
      family: "'Poppins', sans-serif",
      size: 16,
      weight: "600",
    },
    padding: {
      top: 25,
      bottom: 25,
    },
  };

  // Opsi untuk masing-masing chart
  const optionsChart1 = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonTitleStyle,
        text: "Jumlah Kegiatan Per Bulan",
      },
    },
    scales: {
      ...commonChartOptions.scales,
      y: {
        ...commonChartOptions.scales.y,
        title: {
          display: true,
          text: "Jumlah Kegiatan",
          color: chartColors.text,
          font: {
            size: 18,
            weight: "500",
          },
        },
      },
    },
  };

  const optionsChart2 = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonTitleStyle,
        text: "Jumlah Kegiatan Per Prodi",
      },
    },
  };

  const optionsChart3 = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonTitleStyle,
        text: "Jumlah Kegiatan Per Tahun",
      },
    },
  };

  // Beberapa style ringkas
  const cardStyle =
    "card shadow-lg rounded-xl border-0 bg-white hover:shadow-2xl transition-shadow duration-300";
  const cardBodyStyle = "card-body p-5";
  const selectStyle =
    "form-select form-select-sm shadow-sm border-light text-primary rounded-lg hover:border-primary transition-colors duration-200";
  const chartContainerStyle = "bg-white rounded-lg p-4";
  const headerTitleStyle = "text-lg font-semibold text-primary";
  const loadingSpinnerStyle = "spinner-grow text-primary";

  return (
    <div className="container-fluid p-4 bg-gray-50">
      <div className="row g-4">
        <div className="col-12">
          <div className={cardStyle}>
            <div className={cardBodyStyle}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title m-0 text-primary fw-bold">
                  Grafik Jumlah Kegiatan Per Bulan
                </h5>
                <select
                  className={selectStyle}
                  value={selectedYearMonth}
                  onChange={(e) => setSelectedYearMonth(Number(e.target.value))}
                >
                  {yearsAvailable.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      Tahun {yearOption}
                    </option>
                  ))}
                </select>
              </div>
              <div className={chartContainerStyle} style={{ height: "450px" }}>
                {chartData1 ? (
                  <Bar data={chartData1} options={optionsChart1} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className={loadingSpinnerStyle} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grafik Kedua dan Ketiga - Side by Side */}
        <div className="col-md-6">
          <div className={cardStyle}>
            <div className={cardBodyStyle}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title m-0 text-primary fw-bold">
                  Grafik Jumlah Kegiatan Per Tahun
                </h5>
                <div className="d-flex gap-2">
                  <select
                    className={selectStyle}
                    value={fromYear}
                    onChange={(e) => setFromYear(parseInt(e.target.value, 10))}
                  >
                    {yearsAvailable.map((yearOption) => (
                      <option key={yearOption} value={yearOption}>
                        Dari {yearOption}
                      </option>
                    ))}
                  </select>
                  <select
                    className={selectStyle}
                    value={toYear}
                    onChange={(e) => setToYear(parseInt(e.target.value, 10))}
                  >
                    {yearsAvailable.map((yearOption) => (
                      <option key={yearOption} value={yearOption}>
                        Sampai {yearOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={chartContainerStyle} style={{ height: "400px" }}>
                {chartData3 ? (
                  <Bar data={chartData3} options={optionsChart3} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-grow text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className={cardStyle}>
            <div className={cardBodyStyle}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title m-0 text-primary fw-bold">
                  Grafik Jumlah Kegiatan Per Prodi
                </h5>
                <select
                  className={selectStyle}
                  value={selectedYearProdi}
                  onChange={(e) => setSelectedYearProdi(Number(e.target.value))}
                >
                  {yearsAvailable.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      Tahun {yearOption}{" "}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ height: "400px" }}>
                {chartData2 ? (
                  <Bar data={chartData2} options={optionsChart2} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
