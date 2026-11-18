import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Transaction,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  SortOption,
  NavigationTab,
} from '../types';
import {
  formatRupiah,
  formatDateDDMMYYYY,
  MONTH_NAMES,
} from '../utils/formatters';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/Toast';
import { db } from '../database/db';

interface HistoryPageProps {
  transactions: Transaction[];
  availableYears: number[];
  onNavigate: (tab: NavigationTab) => void;
  onEdit: (tx: Transaction) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  transactions,
  availableYears,
  onNavigate,
  onEdit,
}) => {
  const { showToast } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');

  // Filter expand collapse on mobile
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Delete modal state
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMonth('ALL');
    setSelectedYear('ALL');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('terbaru');
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedMonth !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    startDate !== '' ||
    endDate !== '' ||
    minAmount !== '' ||
    maxAmount !== '' ||
    sortBy !== 'terbaru';

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query: nama_barang, kategori, keterangan
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = tx.nama_barang.toLowerCase().includes(q);
          const matchCat = tx.kategori.toLowerCase().includes(q);
          const matchDesc = (tx.keterangan || '').toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }

        // Month filter
        if (selectedMonth !== 'ALL') {
          const parts = tx.tanggal.split('-');
          if (parts.length >= 2) {
            const m = parseInt(parts[1], 10) - 1;
            if (m !== selectedMonth) return false;
          }
        }

        // Year filter
        if (selectedYear !== 'ALL') {
          const parts = tx.tanggal.split('-');
          if (parts.length >= 1) {
            const y = parseInt(parts[0], 10);
            if (y !== selectedYear) return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'ALL') {
          if (tx.kategori !== selectedCategory) return false;
        }

        // Date range
        if (startDate && tx.tanggal < startDate) return false;
        if (endDate && tx.tanggal > endDate) return false;

        // Nominal range
        if (minAmount !== '' && tx.jumlah < Number(minAmount)) return false;
        if (maxAmount !== '' && tx.jumlah > Number(maxAmount)) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'terbaru':
            if (b.tanggal !== a.tanggal) return b.tanggal.localeCompare(a.tanggal);
            return b.created_at - a.created_at;
          case 'terlama':
            if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal);
            return a.created_at - b.created_at;
          case 'terbesar':
            return b.jumlah - a.jumlah;
          case 'terkecil':
            return a.jumlah - b.jumlah;
          default:
            return 0;
        }
      });
  }, [
    transactions,
    searchQuery,
    selectedMonth,
    selectedYear,
    selectedCategory,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
  ]);

  // Total summary of filtered results
  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.jumlah, 0);
  }, [filteredTransactions]);

  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;
    try {
      await db.deleteTransaction(deletingTx.id);
      showToast('Transaksi berhasil dihapus!', 'success');
      setDeletingTx(null);
    } catch (err: any) {
      showToast(`Gagal menghapus: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#27243A]">Riwayat Pengeluaran</h2>
          <p className="text-xs sm:text-sm text-[#88839A] mt-0.5">
            Daftar seluruh transaksi yang tersimpan di perangkatmu
          </p>
        </div>
        <button
          onClick={() => onNavigate('tambah')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-purple-300 transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Tambah Pengeluaran</span>
        </button>
      </div>

      {/* Filter & Search Toolbar Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs space-y-4">
        {/* Row 1: Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-3 text-[#88839A] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang, kategori, atau keterangan..."
              className="w-full pl-10 pr-4 py-2 text-sm text-[#27243A] bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl outline-hidden transition focus:bg-white focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-[#88839A] hover:text-[#27243A] bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl text-xs font-semibold text-[#27243A]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7C3AED]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent outline-hidden cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="terbesar">Nominal Terbesar</option>
                <option value="terkecil">Nominal Terkecil</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="sm:hidden flex items-center gap-1 px-3 py-2 bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl text-xs font-semibold text-[#7C3AED]"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Detailed Filters (Always visible on desktop, toggleable on mobile) */}
        <div className={`space-y-3 pt-3 border-t border-[#EEEAF7] ${showAdvancedFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Bulan */}
            <div>
              <label className="block text-[10px] font-bold text-[#88839A] uppercase mb-1">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))
                }
                className="w-full text-xs py-1.5 px-2.5 bg-[#FAF9FF] border border-[#EEEAF7] rounded-lg text-[#27243A] outline-hidden focus:border-[#A78BFA]"
              >
                <option value="ALL">Semua Bulan</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-[10px] font-bold text-[#88839A] uppercase mb-1">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))
                }
                className="w-full text-xs py-1.5 px-2.5 bg-[#FAF9FF] border border-[#EEEAF7] rounded-lg text-[#27243A] outline-hidden focus:border-[#A78BFA]"
              >
                <option value="ALL">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-[#88839A] uppercase mb-1">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : (e.target.value as ExpenseCategory))
                }
                className="w-full text-xs py-1.5 px-2.5 bg-[#FAF9FF] border border-[#EEEAF7] rounded-lg text-[#27243A] outline-hidden focus:border-[#A78BFA]"
              >
                <option value="ALL">Semua Kategori</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rentang Tanggal Mulai */}
            <div>
              <label className="block text-[10px] font-bold text-[#88839A] uppercase mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs py-1 px-2 bg-[#FAF9FF] border border-[#EEEAF7] rounded-lg text-[#27243A] outline-hidden focus:border-[#A78BFA]"
              />
            </div>

            {/* Rentang Tanggal Selesai */}
            <div>
              <label className="block text-[10px] font-bold text-[#88839A] uppercase mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs py-1 px-2 bg-[#FAF9FF] border border-[#EEEAF7] rounded-lg text-[#27243A] outline-hidden focus:border-[#A78BFA]"
              />
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!isFilterActive}
                className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#88839A] hover:text-[#27243A] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* E. Total Hasil Filter Summary Banner */}
        <div className="pt-3 border-t border-[#EEEAF7] flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#88839A]">Hasil filter:</span>
            <span className="font-bold text-[#27243A] bg-[#EDE9FE] px-2 py-0.5 rounded-md text-[#7C3AED]">
              {filteredTransactions.length} transaksi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#88839A]">Total Nominal:</span>
            <span className="font-extrabold text-sm text-[#7C3AED]">
              {formatRupiah(totalFilteredAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List / Table */}
      <div className="bg-white rounded-2xl border border-[#EEEAF7] shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          /* F. Empty State */
          <div className="py-16 px-4 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
              <Layers className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="text-base font-bold text-[#27243A] mb-1">
              {isFilterActive
                ? 'Tidak ada transaksi yang cocok'
                : 'Belum ada pengeluaran'}
            </h3>
            <p className="text-xs text-[#88839A] mb-5">
              {isFilterActive
                ? 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data lainnya.'
                : 'Mulai catat pengeluaran pertamamu!'}
            </p>
            {isFilterActive ? (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] hover:bg-[#DDD6FE] rounded-xl transition cursor-pointer"
              >
                Reset Filter
              </button>
            ) : (
              <button
                onClick={() => onNavigate('tambah')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 rounded-xl shadow-md shadow-purple-300 transition cursor-pointer"
              >
                + Tambah Pengeluaran Sekarang
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9FF] text-[#88839A] text-xs font-bold uppercase tracking-wider border-b border-[#EEEAF7]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-32">Tanggal</th>
                    <th className="py-3.5 px-4">Nama Barang</th>
                    <th className="py-3.5 px-4 w-44">Kategori</th>
                    <th className="py-3.5 px-4 w-40 text-right">Jumlah</th>
                    <th className="py-3.5 px-4">Keterangan</th>
                    <th className="py-3.5 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEAF7]">
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-[#FAF9FF]/80 transition-colors">
                      <td className="py-3 px-4 text-xs text-[#88839A] text-center font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#27243A] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#88839A]" />
                          <span>{formatDateDDMMYYYY(tx.tanggal)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#27243A]">
                        {tx.nama_barang}
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={tx.kategori} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#27243A]">
                        {formatRupiah(tx.jumlah)}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#88839A] max-w-xs truncate">
                        {tx.keterangan || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 text-[#88839A] hover:text-[#7C3AED] hover:bg-[#EDE9FE] rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTx(tx)}
                            title="Hapus Transaksi"
                            className="p-1.5 text-[#88839A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#EEEAF7]">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-[#FAF9FF] transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#27243A]">{tx.nama_barang}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={tx.kategori} size="sm" />
                        <span className="text-[11px] text-[#88839A]">
                          {formatDateDDMMYYYY(tx.tanggal)}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-[#7C3AED] shrink-0">
                      {formatRupiah(tx.jumlah)}
                    </span>
                  </div>

                  {tx.keterangan && (
                    <p className="text-xs text-[#88839A] bg-[#FAF9FF] px-2.5 py-1.5 rounded-lg border border-[#EEEAF7]">
                      {tx.keterangan}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEEAF7]/50">
                    <button
                      onClick={() => onEdit(tx)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7C3AED] bg-[#EDE9FE] rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingTx(tx)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus Transaksi"
        message={`Apakah kamu yakin ingin menghapus catatan pengeluaran "${deletingTx?.nama_barang}" sebesar ${
          deletingTx ? formatRupiah(deletingTx.jumlah) : ''
        }? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
      />
    </div>
  );
};
