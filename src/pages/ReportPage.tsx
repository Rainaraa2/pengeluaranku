import React, { useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Receipt,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Transaction } from '../types';
import {
  formatRupiah,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  CHART_PALETTE,
} from '../utils/formatters';
import { exportTransactionsToExcel } from '../services/exportExcel';
import { exportTransactionsToPdf } from '../services/exportPdf';
import { useToast } from '../components/ui/Toast';
import { CategoryBadge } from '../components/ui/CategoryBadge';

interface ReportPageProps {
  transactions: Transaction[];
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
}

export const ReportPage: React.FC<ReportPageProps> = ({
  transactions,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  availableYears,
}) => {
  const { showToast } = useToast();

  // Transactions filtered by selected Month and Year
  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const parts = tx.tanggal.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === selectedYear && m === selectedMonth;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // A. Ringkasan Utama
  const totalAmount = useMemo(() => {
    return periodTransactions.reduce((acc, t) => acc + t.jumlah, 0);
  }, [periodTransactions]);

  const totalCount = periodTransactions.length;

  const avgAmount = useMemo(() => {
    return totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
  }, [totalAmount, totalCount]);

  const maxExpense = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.max(...periodTransactions.map((t) => t.jumlah));
  }, [periodTransactions, totalCount]);

  const minExpense = useMemo(() => {
    if (totalCount === 0) return 0;
    return Math.min(...periodTransactions.map((t) => t.jumlah));
  }, [periodTransactions, totalCount]);

  // B. Ringkasan Kategori
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const tx of periodTransactions) {
      if (!map[tx.kategori]) {
        map[tx.kategori] = { count: 0, total: 0 };
      }
      map[tx.kategori].count += 1;
      map[tx.kategori].total += tx.jumlah;
    }

    return Object.entries(map)
      .map(([name, data]) => ({
        name: name as any,
        count: data.count,
        total: data.total,
        percentage: totalAmount > 0 ? ((data.total / totalAmount) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.total - a.total);
  }, [periodTransactions, totalAmount]);

  // C. Bar Chart Data (Tahun yang dipilih)
  const monthlyBarData = useMemo(() => {
    const yearTransactions = transactions.filter((tx) => {
      const parts = tx.tanggal.split('-');
      return parts.length >= 1 && parseInt(parts[0], 10) === selectedYear;
    });

    const monthsSum = new Array(12).fill(0);
    for (const tx of yearTransactions) {
      const parts = tx.tanggal.split('-');
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10) - 1;
        if (m >= 0 && m < 12) {
          monthsSum[m] += tx.jumlah;
        }
      }
    }

    return MONTH_NAMES_SHORT.map((shortName, idx) => ({
      name: shortName,
      fullName: MONTH_NAMES[idx],
      nominal: monthsSum[idx],
      isSelected: idx === selectedMonth,
    }));
  }, [transactions, selectedYear, selectedMonth]);

  // Handle Excel Export
  const handleExportExcel = () => {
    if (periodTransactions.length === 0) {
      showToast(
        `Tidak ada data transaksi di periode ${MONTH_NAMES[selectedMonth]} ${selectedYear} untuk diekspor ke Excel.`,
        'error'
      );
      return;
    }
    try {
      exportTransactionsToExcel({
        month: selectedMonth,
        year: selectedYear,
        transactions: periodTransactions,
      });
      showToast('Laporan Excel berhasil diunduh!', 'success');
    } catch (err: any) {
      showToast(`Gagal mengunduh Excel: ${err.message}`, 'error');
    }
  };

  // Handle PDF Export
  const handleExportPdf = () => {
    if (periodTransactions.length === 0) {
      showToast(
        `Tidak ada data transaksi di periode ${MONTH_NAMES[selectedMonth]} ${selectedYear} untuk dibuatkan dokumen PDF.`,
        'error'
      );
      return;
    }
    try {
      exportTransactionsToPdf({
        month: selectedMonth,
        year: selectedYear,
        transactions: periodTransactions,
      });
      showToast('Laporan PDF berhasil diunduh!', 'success');
    } catch (err: any) {
      showToast(`Gagal membuat PDF: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#27243A]">Laporan & Analisis Keuangan</h2>
          <p className="text-xs sm:text-sm text-[#88839A] mt-0.5">
            Analisis detail dan ekspor dokumen resmi periode {MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
        </div>

        {/* Toolbar: Month/Year selector & Export buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl px-3 py-2 text-xs font-semibold text-[#27243A]">
            <Calendar className="w-4 h-4 text-[#7C3AED]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent outline-hidden cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent outline-hidden cursor-pointer border-l border-[#EEEAF7] pl-1.5"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
            title="Download Laporan Format .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download Excel</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#F3E8FF] hover:bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] text-xs font-bold rounded-xl shadow-2xs transition cursor-pointer"
            title="Download Laporan Format .pdf"
          >
            <FileText className="w-4 h-4 text-[#7C3AED]" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {periodTransactions.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p>
            Belum ada transaksi yang tercatat pada <strong>{MONTH_NAMES[selectedMonth]} {selectedYear}</strong>. Grafik dan laporan akan terisi otomatis setelah kamu menambahkan pengeluaran di periode ini.
          </p>
        </div>
      )}

      {/* A. 5 Ringkasan Utama KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Pengeluaran */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-white via-[#FAF9FF] to-[#DDD6FE]/40 border border-[#DDD6FE] shadow-2xs">
          <div className="flex items-center justify-between text-[#7C3AED] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Periode</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-xl font-extrabold text-[#27243A]">{formatRupiah(totalAmount)}</h4>
          <p className="text-[11px] text-[#88839A] mt-1">{MONTH_NAMES[selectedMonth]} {selectedYear}</p>
        </div>

        {/* Jumlah Transaksi */}
        <div className="p-4 rounded-2xl bg-white border border-[#EEEAF7] shadow-2xs">
          <div className="flex items-center justify-between text-[#88839A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Jumlah Transaksi</span>
            <Receipt className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <h4 className="text-xl font-extrabold text-[#27243A]">{totalCount} item</h4>
          <p className="text-[11px] text-[#88839A] mt-1">Total pencatatan</p>
        </div>

        {/* Rata-rata per Transaksi */}
        <div className="p-4 rounded-2xl bg-white border border-[#EEEAF7] shadow-2xs">
          <div className="flex items-center justify-between text-[#88839A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Rata-rata</span>
            <Calculator className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <h4 className="text-xl font-extrabold text-[#27243A]">{formatRupiah(avgAmount)}</h4>
          <p className="text-[11px] text-[#88839A] mt-1">Per transaksi</p>
        </div>

        {/* Pengeluaran Terbesar */}
        <div className="p-4 rounded-2xl bg-white border border-[#EEEAF7] shadow-2xs">
          <div className="flex items-center justify-between text-[#88839A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Terbesar</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <h4 className="text-lg font-extrabold text-[#27243A]">{formatRupiah(maxExpense)}</h4>
          <p className="text-[11px] text-[#88839A] mt-1">Nominal puncak</p>
        </div>

        {/* Pengeluaran Terkecil */}
        <div className="p-4 rounded-2xl bg-white border border-[#EEEAF7] shadow-2xs">
          <div className="flex items-center justify-between text-[#88839A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Terkecil</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-lg font-extrabold text-[#27243A]">{formatRupiah(minExpense)}</h4>
          <p className="text-[11px] text-[#88839A] mt-1">Nominal minimum</p>
        </div>
      </div>

      {/* C. Grafik: Pie & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#27243A]">Persentase per Kategori</h3>
          </div>

          {categoryStats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <PieIcon className="w-10 h-10 text-[#DDD6FE] mb-2" />
              <p className="text-xs text-[#88839A]">Tidak ada data untuk ditampilkan</p>
            </div>
          ) : (
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="total"
                  >
                    {categoryStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), 'Total']}
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#EEEAF7',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(167, 139, 250, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Tren Bulanan */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#27243A]">Komparasi Bulanan {selectedYear}</h3>
            </div>
            <span className="text-xs text-[#88839A]">Tahun {selectedYear}</span>
          </div>

          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0F7" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#EEEAF7' }}
                  tick={{ fill: '#88839A', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#88839A', fontSize: 10 }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}jt`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
                    return val.toString();
                  }}
                />
                <RechartsTooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Pengeluaran']}
                  labelFormatter={(_l, p) => (p && p[0] ? p[0].payload.fullName : '')}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#EEEAF7',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="nominal" radius={[6, 6, 0, 0]}>
                  {monthlyBarData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.isSelected ? '#7C3AED' : '#C4B5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* B. Ringkasan Kategori (Table & Progress Bars) */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#27243A]">Rincian Kategori Pengeluaran</h3>
            <p className="text-xs text-[#88839A]">
              Urutan pengeluaran dari nominal terbesar pada periode ini
            </p>
          </div>
          <span className="text-xs font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-lg">
            {categoryStats.length} Kategori Aktif
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <p className="text-xs text-center text-[#88839A] py-6">
            Belum ada data kategori untuk periode ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9FF] text-[#88839A] text-xs font-bold uppercase tracking-wider border-b border-[#EEEAF7]">
                <tr>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Jumlah Transaksi</th>
                  <th className="py-3 px-4 text-right">Total Pengeluaran</th>
                  <th className="py-3 px-4 text-right w-44">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEAF7]">
                {categoryStats.map((item) => (
                  <tr key={item.name} className="hover:bg-[#FAF9FF]/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-[#27243A]">
                      <CategoryBadge category={item.name} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-[#88839A] font-medium">
                      {item.count} transaksi
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#27243A]">
                      {formatRupiah(item.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] h-full rounded-full"
                            style={{ width: `${Math.min(100, parseFloat(item.percentage))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#7C3AED] w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
