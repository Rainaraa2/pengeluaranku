import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { formatRupiah, formatDateDDMMYYYY, MONTH_NAMES } from '../utils/formatters';

export interface ExportPdfOptions {
  month: number; // 0 - 11
  year: number;
  transactions: Transaction[];
}

export function exportTransactionsToPdf({ month, year, transactions }: ExportPdfOptions): void {
  const monthName = MONTH_NAMES[month];
  const filename = `Laporan_Pengeluaran_${monthName}_${year}.pdf`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Brand Colors
  const lilacPrimary = [167, 139, 250];   // #A78BFA
  const deepPurple = [124, 58, 237];      // #7C3AED
  const lavenderSoft = [243, 232, 255];   // #F3E8FF
  const textDark = [39, 36, 58];          // #27243A
  const textMuted = [136, 131, 154];      // #88839A

  // 1. Header Banner / Decorative Top Bar
  doc.setFillColor(deepPurple[0], deepPurple[1], deepPurple[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Decorative soft background badge
  doc.setFillColor(lavenderSoft[0], lavenderSoft[1], lavenderSoft[2]);
  doc.roundedRect(14, 12, pageWidth - 28, 26, 3, 3, 'F');

  // Logo / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(deepPurple[0], deepPurple[1], deepPurple[2]);
  doc.text('PengeluaranKu', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Aplikasi Pencatat Pengeluaran Pribadi', 20, 28);

  // Document Title & Period (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('LAPORAN PENGELUARAN BULANAN', pageWidth - 20, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(deepPurple[0], deepPurple[1], deepPurple[2]);
  doc.text(`Periode: ${monthName} ${year}`, pageWidth - 20, 28, { align: 'right' });

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Dibuat pada: ${printDate}`, pageWidth - 20, 33, { align: 'right' });

  // 2. Summary KPI Metrics Boxes
  const totalAmount = transactions.reduce((sum, t) => sum + t.jumlah, 0);
  const totalCount = transactions.length;
  const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
  const maxExpense = totalCount > 0 ? Math.max(...transactions.map((t) => t.jumlah)) : 0;

  const boxY = 44;
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const boxHeight = 20;

  const stats = [
    { label: 'TOTAL PENGELUARAN', value: formatRupiah(totalAmount), highlight: true },
    { label: 'JUMLAH TRANSAKSI', value: `${totalCount} item`, highlight: false },
    { label: 'RATA-RATA / TRANSAKSI', value: formatRupiah(avgAmount), highlight: false },
    { label: 'PENGELUARAN TERBESAR', value: formatRupiah(maxExpense), highlight: false },
  ];

  stats.forEach((st, idx) => {
    const boxX = 14 + idx * (boxWidth + 3);
    if (st.highlight) {
      doc.setFillColor(237, 233, 254); // lavender soft
      doc.setDrawColor(lilacPrimary[0], lilacPrimary[1], lilacPrimary[2]);
    } else {
      doc.setFillColor(250, 249, 255);
      doc.setDrawColor(238, 234, 247);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(st.label, boxX + 4, boxY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(st.highlight ? 9.5 : 8.5);
    doc.setTextColor(st.highlight ? deepPurple[0] : textDark[0], st.highlight ? deepPurple[1] : textDark[1], st.highlight ? deepPurple[2] : textDark[2]);
    doc.text(st.value, boxX + 4, boxY + 14);
  });

  // 3. Category Breakdown Table
  const categoryStats: Record<string, { count: number; total: number }> = {};
  for (const tx of transactions) {
    if (!categoryStats[tx.kategori]) {
      categoryStats[tx.kategori] = { count: 0, total: 0 };
    }
    categoryStats[tx.kategori].count += 1;
    categoryStats[tx.kategori].total += tx.jumlah;
  }

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1].total - a[1].total);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Ringkasan Kategori', 14, 72);

  const categoryTableRows = sortedCategories.map(([catName, data]) => {
    const pct = totalAmount > 0 ? ((data.total / totalAmount) * 100).toFixed(1) + '%' : '0%';
    return [catName, `${data.count} transaksi`, formatRupiah(data.total), pct];
  });

  autoTable(doc, {
    startY: 75,
    margin: { left: 14, right: 14 },
    head: [['Kategori', 'Jumlah Transaksi', 'Total Pengeluaran', 'Persentase']],
    body: categoryTableRows.length > 0 ? categoryTableRows : [['Tidak ada data transaksi kategori', '-', '-', '-']],
    theme: 'plain',
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      textColor: [39, 36, 58],
      cellPadding: 2.2,
      lineColor: [238, 234, 247],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 255],
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 40 },
      2: { cellWidth: 45, halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' },
    },
  });

  // 4. Detail Transactions Table
  const finalCategoryY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 120;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Daftar Detail Transaksi', 14, finalCategoryY);

  const detailRows = transactions.map((tx, idx) => [
    idx + 1,
    formatDateDDMMYYYY(tx.tanggal),
    tx.nama_barang,
    tx.kategori,
    formatRupiah(tx.jumlah),
    tx.keterangan || '-',
  ]);

  autoTable(doc, {
    startY: finalCategoryY + 3,
    margin: { left: 14, right: 14 },
    head: [['No', 'Tanggal', 'Nama Barang', 'Kategori', 'Jumlah', 'Keterangan']],
    body: detailRows.length > 0 ? detailRows : [['-', '-', 'Belum ada transaksi pada periode ini', '-', '-', '-']],
    theme: 'plain',
    headStyles: {
      fillColor: [167, 139, 250],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      textColor: [39, 36, 58],
      cellPadding: 2.2,
      lineColor: [238, 234, 247],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [250, 249, 255],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 24 },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 35 },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer page numbering on every page
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(
        `PengeluaranKu • Halaman ${data.pageNumber} dari ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    },
  });

  // Save PDF
  doc.save(filename);
}
