import React, { useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  Award,
  Plus,
  ArrowRight,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
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
import { Transaction, NavigationTab } from '../types';
import {
  formatRupiah,
  formatDateDDMMYYYY,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  CHART_PALETTE,
} from '../utils/formatters';
import { CategoryBadge } from '../components/ui/CategoryBadge';

interface DashboardPageProps {
  transactions: Transaction[];
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  onNavigate: (tab: NavigationTab) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  availableYears,
  onNavigate,
}) => {
  // Filter transactions by selected Month and Year
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const parts = tx.tanggal.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed
      return y === selectedYear && m === selectedMonth;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Total summary calculations
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.jumlah, 0);
  }, [filteredTransactions]);

  const totalCount = filteredTransactions.length;

  // Largest expense in this period
  const largestExpense = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    return Math.max(...filteredTransactions.map((t) => t.jumlah));
  }, [filteredTransactions]);

  // Highest category in this period
  const highestCategory = useMemo(() => {
    if (filteredTransactions.length === 0) return { name: '-', total: 0 };
    const catMap: Record<string, number> = {};
    for (const tx of filteredTransactions) {
      catMap[tx.kategori] = (catMap[tx.kategori] || 0) + tx.jumlah;
    }
    let topCat = '-';
    let maxVal = 0;
    for (const [cat, val] of Object.entries(catMap)) {
      if (val > maxVal) {
        maxVal = val;
        topCat = cat;
      }
    }
    return { name: topCat, total: maxVal };
  }, [filteredTransactions]);

  // Pie chart data: Category breakdown
  const categoryChartData = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const tx of filteredTransactions) {
      catMap[tx.kategori] = (catMap[tx.kategori] || 0) + tx.jumlah;
    }
    return Object.entries(catMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalAmount]);

  // Bar chart data: Monthly expenses for the selected year
  const monthlyComparisonData = useMemo(() => {
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

  // Recent 5 transactions (from whole dataset or filtered? Prompt says "Tampilkan maksimal 5 transaksi terbaru")
  // Let's sort by date descending and id/created_at descending
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        if (b.tanggal !== a.tanggal) {
          return b.tanggal.localeCompare(a.tanggal);
        }
        return b.created_at - a.created_at;
      })
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#EEEAF7] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#27243A]">Dashboard Keuangan</h2>
          <p className="text-xs sm:text-sm text-[#88839A] mt-0.5">
            Pantau ringkasan dan alur pengeluaran pribadimu
          </p>
        </div>

        {/* Period Selector (Month & Year) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl px-3 py-1.5 text-xs font-medium text-[#27243A]">
            <Calendar className="w-4 h-4 text-[#7C3AED]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent font-semibold outline-hidden cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl px-3 py-1.5 text-xs font-medium text-[#27243A]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent font-semibold outline-hidden cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => onNavigate('tambah')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-purple-300 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Tambah Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Card: Total Pengeluaran Bulan Ini (Lilac Gradient Design) */}
        <div className="sm:col-span-2 lg:col-span-1 rounded-2xl p-5 bg-gradient-to-br from-white via-[#FAF9FF] to-[#DDD6FE]/40 border border-[#DDD6FE] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#A78BFA]/10 rounded-full blur-2xl group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider bg-[#EDE9FE] px-2.5 py-1 rounded-lg">
              Total Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/80 shadow-xs border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#27243A] tracking-tight">
              {formatRupiah(totalAmount)}
            </h3>
            <p className="text-xs text-[#88839A] mt-1 font-medium">
              Periode {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>

        {/* Card: Jumlah Transaksi */}
        <div className="rounded-2xl p-5 bg-white border border-[#EEEAF7] shadow-xs hover:border-[#DDD6FE] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88839A] uppercase tracking-wider">
              Jumlah Transaksi
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-center text-[#A78BFA]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#27243A]">
              {totalCount}{' '}
              <span className="text-sm font-normal text-[#88839A]">transaksi</span>
            </h3>
            <p className="text-xs text-[#88839A] mt-1 font-medium">
              {totalCount > 0 ? 'Tercatat rapi di sistem' : 'Belum ada transaksi'}
            </p>
          </div>
        </div>

        {/* Card: Pengeluaran Terbesar */}
        <div className="rounded-2xl p-5 bg-white border border-[#EEEAF7] shadow-xs hover:border-[#DDD6FE] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88839A] uppercase tracking-wider">
              Terbesar
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-center text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[#27243A]">
              {formatRupiah(largestExpense)}
            </h3>
            <p className="text-xs text-[#88839A] mt-1 font-medium truncate">
              {largestExpense > 0 ? 'Pengeluaran nominal tertinggi' : '-'}
            </p>
          </div>
        </div>

        {/* Card: Kategori Tertinggi */}
        <div className="rounded-2xl p-5 bg-white border border-[#EEEAF7] shadow-xs hover:border-[#DDD6FE] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88839A] uppercase tracking-wider">
              Kategori Terbanyak
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-center text-[#7C3AED]">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold text-[#27243A] truncate">
              {highestCategory.name}
            </h3>
            <p className="text-xs text-[#7C3AED] font-semibold mt-1">
              {highestCategory.total > 0 ? formatRupiah(highestCategory.total) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section: Pie & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Kategori Pengeluaran */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#27243A]">Distribusi Kategori</h3>
            </div>
            <span className="text-xs text-[#88839A]">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>

          {categoryChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-center text-[#A78BFA] mb-2">
                <PieIcon className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-xs text-[#88839A] font-medium">
                Belum ada transaksi di bulan ini
              </p>
            </div>
          ) : (
            <>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, index) => (
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

              {/* Category Legend & Nominal */}
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categoryChartData.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-[#FAF9FF]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                      />
                      <span className="text-[#27243A] font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-[#27243A]">
                        {formatRupiah(item.value)}
                      </span>
                      <span className="text-[11px] text-[#88839A] font-medium w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar Chart: Pengeluaran Bulanan per Tahun */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#27243A]">Tren Pengeluaran Bulanan</h3>
                <p className="text-xs text-[#88839A]">Tahun {selectedYear}</p>
              </div>
            </div>
            <span className="text-xs text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-lg font-medium">
              12 Bulan
            </span>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  labelFormatter={(_label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return '';
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#EEEAF7',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(167, 139, 250, 0.1)',
                  }}
                />
                <Bar
                  dataKey="nominal"
                  radius={[6, 6, 0, 0]}
                  fill="#A78BFA"
                  onClick={(entry) => {
                    const idx = MONTH_NAMES_SHORT.indexOf(entry.name);
                    if (idx !== -1) setSelectedMonth(idx);
                  }}
                  className="cursor-pointer"
                >
                  {monthlyComparisonData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.isSelected ? '#7C3AED' : '#C4B5FD'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-center text-[#88839A] mt-2">
            Klik batang grafik untuk berganti bulan aktif (batang gelap: bulan terpilih)
          </p>
        </div>
      </div>

      {/* Recent Transactions List (Max 5) */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#27243A]">Transaksi Terbaru</h3>
            <p className="text-xs text-[#88839A]">5 pengeluaran terakhir yang kamu catat</p>
          </div>
          <button
            onClick={() => onNavigate('riwayat')}
            className="flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] group cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center bg-[#FAF9FF] rounded-xl border border-dashed border-[#DDD6FE]">
            <p className="text-sm font-medium text-[#88839A]">
              Belum ada pengeluaran yang dicatat.
            </p>
            <button
              onClick={() => onNavigate('tambah')}
              className="mt-3 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-xl shadow-xs"
            >
              + Catat Pengeluaran Pertamamu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEEAF7]">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-[#FAF9FF] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <CategoryBadge category={tx.kategori} size="sm" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#27243A]">
                      {tx.nama_barang}
                    </h4>
                    <p className="text-xs text-[#88839A]">
                      {formatDateDDMMYYYY(tx.tanggal)}
                      {tx.keterangan ? ` • ${tx.keterangan}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#27243A]">
                    {formatRupiah(tx.jumlah)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
