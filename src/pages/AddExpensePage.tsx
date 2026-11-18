import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  X,
  Calendar,
  Tag,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { Transaction, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { useToast } from '../components/ui/Toast';
import { db } from '../database/db';

interface AddExpensePageProps {
  editingTransaction?: Transaction | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddExpensePage: React.FC<AddExpensePageProps> = ({
  editingTransaction,
  onSuccess,
  onCancel,
}) => {
  const { showToast } = useToast();

  const [namaBarang, setNamaBarang] = useState('');
  const [tanggal, setTanggal] = useState(getTodayDateString());
  const [kategori, setKategori] = useState<ExpenseCategory>('Makanan & Minuman');
  const [jumlah, setJumlah] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  // Form errors
  const [errors, setErrors] = useState<{
    namaBarang?: string;
    tanggal?: string;
    jumlah?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // If editing, pre-fill form
  useEffect(() => {
    if (editingTransaction) {
      setNamaBarang(editingTransaction.nama_barang);
      setTanggal(editingTransaction.tanggal);
      setKategori(editingTransaction.kategori);
      setJumlah(editingTransaction.jumlah);
      setKeterangan(editingTransaction.keterangan || '');
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setNamaBarang('');
    setTanggal(getTodayDateString());
    setKategori('Makanan & Minuman');
    setJumlah(0);
    setKeterangan('');
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!namaBarang.trim()) {
      errs.namaBarang = 'Nama barang wajib diisi.';
    }

    if (!tanggal) {
      errs.tanggal = 'Tanggal wajib dipilih.';
    }

    if (!jumlah || jumlah <= 0) {
      errs.jumlah = 'Nominal harus lebih besar dari Rp 0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Mohon lengkapi formulir dengan benar.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        // Update
        await db.updateTransaction(editingTransaction.id, {
          nama_barang: namaBarang.trim(),
          tanggal,
          kategori,
          jumlah,
          keterangan: keterangan.trim(),
        });
        showToast('Transaksi berhasil diperbarui!', 'success');
      } else {
        // Create
        await db.addTransaction({
          nama_barang: namaBarang.trim(),
          tanggal,
          kategori,
          jumlah,
          keterangan: keterangan.trim(),
        });
        showToast('Pengeluaran berhasil dicatat!', 'success');
        resetForm();
      }

      onSuccess();
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs">
        <h2 className="text-xl font-bold text-[#27243A]">
          {editingTransaction ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
        </h2>
        <p className="text-xs sm:text-sm text-[#88839A] mt-0.5">
          {editingTransaction
            ? 'Perbarui data transaksi pengeluaran yang sudah dicatat'
            : 'Catat pengeluaranmu secara detail agar keuangan tetap terkontrol'}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EEEAF7] shadow-sm space-y-5">
        {/* A. Nama Barang */}
        <div>
          <label htmlFor="nama_barang" className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-1.5">
            Nama Barang / Keperluan <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-3 text-[#88839A] pointer-events-none">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <input
              id="nama_barang"
              type="text"
              value={namaBarang}
              onChange={(e) => {
                setNamaBarang(e.target.value);
                if (errors.namaBarang) setErrors((prev) => ({ ...prev, namaBarang: undefined }));
              }}
              placeholder="Contoh: Makan siang, Bensin, Buku kuliah"
              className={`w-full pl-10 pr-4 py-2.5 text-sm text-[#27243A] bg-white border rounded-xl outline-hidden transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#A78BFA]/30 ${
                errors.namaBarang ? 'border-rose-400 focus:border-rose-500' : 'border-[#EEEAF7] focus:border-[#A78BFA]'
              }`}
            />
          </div>
          {errors.namaBarang && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.namaBarang}</p>}
        </div>

        {/* B & C. Tanggal & Kategori in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* B. Tanggal */}
          <div>
            <label htmlFor="tanggal" className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-1.5">
              Tanggal Transaksi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-[#88839A] pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  if (errors.tanggal) setErrors((prev) => ({ ...prev, tanggal: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm text-[#27243A] bg-white border rounded-xl outline-hidden transition cursor-pointer focus:ring-2 focus:ring-[#A78BFA]/30 ${
                  errors.tanggal ? 'border-rose-400 focus:border-rose-500' : 'border-[#EEEAF7] focus:border-[#A78BFA]'
                }`}
              />
            </div>
            {errors.tanggal && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.tanggal}</p>}
          </div>

          {/* C. Kategori */}
          <div>
            <label htmlFor="kategori" className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-1.5">
              Kategori Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-[#88839A] pointer-events-none">
                <Tag className="w-4 h-4" />
              </div>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value as ExpenseCategory)}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-[#27243A] bg-white border border-[#EEEAF7] rounded-xl outline-hidden transition cursor-pointer focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/30"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* D. Jumlah (Rupiah Input) */}
        <div>
          <label htmlFor="jumlah" className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-1.5">
            Nominal Pengeluaran <span className="text-rose-500">*</span>
          </label>
          <CurrencyInput
            id="jumlah"
            value={jumlah}
            onChange={(val) => {
              setJumlah(val);
              if (errors.jumlah) setErrors((prev) => ({ ...prev, jumlah: undefined }));
            }}
            placeholder="0"
            error={errors.jumlah}
          />
          <p className="mt-1 text-[11px] text-[#88839A]">
            Contoh: Masukkan angka saja, otomatis diformat ke Rupiah (Rp25.000)
          </p>
        </div>

        {/* E. Keterangan (Opsional) */}
        <div>
          <label htmlFor="keterangan" className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-1.5">
            Keterangan Tambahan <span className="text-xs text-[#88839A] lowercase font-normal">(opsional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-3 text-[#88839A] pointer-events-none">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="keterangan"
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan tambahan, misalnya: Bersama rekan kantor, diskon promo, dll."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-[#27243A] bg-white border border-[#EEEAF7] rounded-xl outline-hidden transition placeholder:text-gray-400 focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/30"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#EEEAF7] flex flex-col sm:flex-row items-center justify-end gap-3">
          {!editingTransaction && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-[#88839A] hover:text-[#27243A] hover:bg-[#FAF9FF] border border-[#EEEAF7] rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-[#88839A] hover:text-[#27243A] hover:bg-gray-100 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Batal</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-300 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{editingTransaction ? 'Perbarui Pengeluaran' : 'Simpan Pengeluaran'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
