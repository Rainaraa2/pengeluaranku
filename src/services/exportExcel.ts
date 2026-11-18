import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import { formatRupiah, formatDateDDMMYYYY, MONTH_NAMES } from '../utils/formatters';

export interface ExportReportOptions {
  month: number; // 0 - 11
  year: number;
  transactions: Transaction[];
}

export function exportTransactionsToExcel({ month, year, transactions }: ExportReportOptions): void {
  const monthName = MONTH_NAMES[month];
  const filename = `Laporan_Pengeluaran_${monthName}_${year}.xlsx`;

  // 1. Prepare Sheet 1: Detail Pengeluaran
  const detailHeaders = ['No', 'Tanggal', 'Nama Barang', 'Kategori', 'Jumlah', 'Keterangan'];
  const detailRows = transactions.map((tx, idx) => [
    idx + 1,
    formatDateDDMMYYYY(tx.tanggal),
    tx.nama_barang,
    tx.kategori,
    formatRupiah(tx.jumlah),
    tx.keterangan || '-',
  ]);

  const detailData = [detailHeaders, ...detailRows];
  const wsDetail = XLSX.utils.aoa_to_sheet(detailData);

  // Set column widths for detail sheet
  wsDetail['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 28 }, // Nama Barang
    { wch: 20 }, // Kategori
    { wch: 18 }, // Jumlah
    { wch: 32 }, // Keterangan
  ];

  // 2. Prepare Sheet 2: Ringkasan
  const totalAmount = transactions.reduce((acc, tx) => acc + tx.jumlah, 0);
  const totalCount = transactions.length;
  const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Group by category
  const categoryStats: Record<string, { count: number; total: number }> = {};
  for (const tx of transactions) {
    if (!categoryStats[tx.kategori]) {
      categoryStats[tx.kategori] = { count: 0, total: 0 };
    }
    categoryStats[tx.kategori].count += 1;
    categoryStats[tx.kategori].total += tx.jumlah;
  }

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1].total - a[1].total);

  const summaryData: any[][] = [
    ['RINGKASAN LAPORAN KEUANGAN PENGELUARANKU'],
    ['Periode', `${monthName} ${year}`],
    ['Tanggal Pembuatan', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
    ['Total Pengeluaran', formatRupiah(totalAmount)],
    ['Jumlah Transaksi', `${totalCount} transaksi`],
    ['Rata-rata per Transaksi', formatRupiah(avgAmount)],
    [],
    ['RINCIAN PER KATEGORI'],
    ['Kategori', 'Jumlah Transaksi', 'Total Pengeluaran', 'Persentase'],
  ];

  for (const [catName, stat] of sortedCategories) {
    const percentage = totalAmount > 0 ? ((stat.total / totalAmount) * 100).toFixed(1) + '%' : '0%';
    summaryData.push([
      catName,
      `${stat.count} transaksi`,
      formatRupiah(stat.total),
      percentage,
    ]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths for summary sheet
  wsSummary['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 22 },
    { wch: 15 },
  ];

  // Create workbook and append sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Pengeluaran');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Trigger download
  XLSX.writeFile(wb, filename);
}
