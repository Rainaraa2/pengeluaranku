import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  HardDrive,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Database,
  Calendar,
  MonitorDown,
} from 'lucide-react';
import { Transaction, BackupData } from '../types';
import {
  createBackupJson,
  validateBackupJsonString,
  restoreReplaceAll,
  restoreMerge,
} from '../services/backupRestore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { formatDateReadable } from '../utils/formatters';

interface SettingsPageProps {
  transactions: Transaction[];
  onDataChanged: () => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  transactions,
  onDataChanged,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage and backup metadata state
  const [storageUsage, setStorageUsage] = useState<string>('Menghitung...');
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  // Restore states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validatedData, setValidatedData] = useState<BackupData | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('merge');
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load storage usage and last backup from localStorage
  useEffect(() => {
    const savedLastBackup = localStorage.getItem('pengeluaranku_last_backup');
    if (savedLastBackup) {
      setLastBackupDate(savedLastBackup);
    }

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          const usedKB = Math.round((estimate.usage || 0) / 1024);
          if (usedKB > 1024) {
            setStorageUsage(`${(usedKB / 1024).toFixed(2)} MB`);
          } else {
            setStorageUsage(`${usedKB} KB`);
          }
        })
        .catch(() => {
          setStorageUsage('Aktif (IndexedDB)');
        });
    } else {
      setStorageUsage('Aktif (IndexedDB)');
    }
  }, [transactions]);

  // Handle Backup
  const handleBackup = () => {
    try {
      createBackupJson(transactions);
      const nowIso = new Date().toISOString();
      localStorage.setItem('pengeluaranku_last_backup', nowIso);
      setLastBackupDate(nowIso);
      showToast(
        `Berhasil mencadangkan ${transactions.length} transaksi ke file JSON!`,
        'success'
      );
    } catch (err: any) {
      showToast(`Gagal mencadangkan data: ${err.message}`, 'error');
    }
  };

  // Handle File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('File harus berformat .json', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateBackupJsonString(content);

      if (!result.isValid || !result.data) {
        showToast(
          result.errorMessage || 'File JSON rusak atau tidak sesuai format backup PengeluaranKu.',
          'error'
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setSelectedFile(file);
      setValidatedData(result.data);
      setIsRestoreModalOpen(true);
    };

    reader.onerror = () => {
      showToast('Gagal membaca file dari perangkat.', 'error');
    };

    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!validatedData) return;
    setIsProcessing(true);

    try {
      if (restoreMode === 'replace') {
        const count = await restoreReplaceAll(validatedData.transactions);
        showToast(
          `Sukses! Seluruh data diganti dengan ${count} transaksi dari backup.`,
          'success'
        );
      } else {
        const { added, skipped } = await restoreMerge(validatedData.transactions);
        showToast(
          `Sukses! ${added} transaksi baru ditambahkan (${skipped} transaksi terlewati karena sudah ada).`,
          'success'
        );
      }

      setIsRestoreModalOpen(false);
      setSelectedFile(null);
      setValidatedData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onDataChanged();
    } catch (err: any) {
      showToast(`Gagal memulihkan data: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs">
        <h2 className="text-xl font-bold text-[#27243A]">Pengaturan & Manajemen Data</h2>
        <p className="text-xs sm:text-sm text-[#88839A] mt-0.5">
          Kelola pencadangan, pemulihan data, dan informasi status sistem penyimpanan
        </p>
      </div>

      {/* App Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EEEAF7]">
          <div className="p-1.5 rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-[#27243A]">Informasi Aplikasi</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7]">
            <span className="text-[11px] font-medium text-[#88839A] uppercase tracking-wider block">
              Nama Aplikasi
            </span>
            <span className="text-sm font-bold text-[#27243A] mt-0.5 block">
              PengeluaranKu
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7]">
            <span className="text-[11px] font-medium text-[#88839A] uppercase tracking-wider block">
              Versi Aplikasi
            </span>
            <span className="text-sm font-bold text-[#7C3AED] mt-0.5 block">
              v1.0.0 (Stable)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7]">
            <span className="text-[11px] font-medium text-[#88839A] uppercase tracking-wider block">
              Transaksi Tersimpan
            </span>
            <span className="text-sm font-bold text-[#27243A] mt-0.5 block">
              {transactions.length} transaksi
            </span>
          </div>
        </div>
      </div>

      {/* Desktop App (PWA) Section */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/icon-192.png"
              alt="Logo PengeluaranKu"
              className="w-12 h-12 rounded-2xl shadow-sm border border-purple-100 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#27243A]">Aplikasi Desktop (PWA)</h3>
                <span className="text-[10px] font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
                  {isInstalled ? 'Sudah Terpasang' : 'Siap Diunduh'}
                </span>
              </div>
              <p className="text-xs text-[#88839A] mt-0.5">
                Pasang icon PengeluaranKu di Desktop Windows/Mac atau Layar Utama HP untuk akses cepat
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-purple-200 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MonitorDown className="w-4 h-4" />
            <span>{isInstalled ? 'Buka Panduan Desktop' : 'Pasang di Desktop'}</span>
          </button>
        </div>
      </div>

      {/* Data Management Section: Backup & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Backup Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-[#7C3AED]">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#27243A]">Cadangkan Data (Backup)</h4>
                <p className="text-xs text-[#88839A]">Ekspor seluruh transaksi ke file JSON</p>
              </div>
            </div>

            <p className="text-xs text-[#27243A] leading-relaxed">
              Unduh salinan cadangan dari seluruh transaksi yang ada. File JSON dapat disimpan di komputer, flashdisk, atau Google Drive agar catatan keuanganmu aman.
            </p>

            <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] text-xs space-y-1.5">
              <div className="flex justify-between text-[#88839A]">
                <span>Jumlah transaksi:</span>
                <strong className="text-[#27243A]">{transactions.length} item</strong>
              </div>
              <div className="flex justify-between text-[#88839A]">
                <span>Terakhir dicadangkan:</span>
                <strong className="text-[#27243A]">
                  {lastBackupDate
                    ? formatDateReadable(lastBackupDate.substring(0, 10))
                    : 'Belum pernah'}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleBackup}
            disabled={transactions.length === 0}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-purple-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Backup Data ({transactions.length})</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#27243A]">Pulihkan Data (Restore)</h4>
                <p className="text-xs text-[#88839A]">Impor transaksi dari file JSON backup</p>
              </div>
            </div>

            <p className="text-xs text-[#27243A] leading-relaxed">
              Pulihkan data pengeluaran dari file JSON yang pernah kamu cadangkan. Tersedia opsi untuk <strong>menggabungkan</strong> data atau <strong>mengganti semua</strong> transaksi yang ada.
            </p>

            <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] text-xs text-[#88839A] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Sistem secara otomatis memvalidasi keutuhan dan format data sebelum dimasukkan ke database.
              </span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF9FF] text-[#7C3AED] border border-[#DDD6FE] text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih File Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Storage Information Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EEEAF7] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FAF9FF] text-[#88839A] border border-[#EEEAF7]">
            <HardDrive className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#27243A]">Status Penyimpanan Lokal</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-between">
            <span className="text-[#88839A]">Database Mesin:</span>
            <span className="font-semibold text-[#27243A] flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
              IndexedDB (Dexie.js)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] flex items-center justify-between">
            <span className="text-[#88839A]">Perkiraan Penggunaan:</span>
            <span className="font-semibold text-[#27243A]">{storageUsage}</span>
          </div>
        </div>

        <p className="text-[11px] text-[#88839A] leading-relaxed">
          Catatan: Data tersimpan secara offline di browser perangkat ini. Data tidak akan hilang saat browser ditutup atau halaman dimuat ulang. Selalu lakukan backup rutin jika ingin berpindah browser atau perangkat.
        </p>
      </div>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setIsRestoreModalOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }}
        title="Konfirmasi Pemulihan Data (Restore)"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* File summary */}
          <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#88839A]">File terpilih:</span>
              <strong className="text-[#27243A] truncate max-w-[200px]">
                {selectedFile?.name}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#88839A]">Jumlah transaksi di file:</span>
              <strong className="text-[#7C3AED] font-bold">
                {validatedData?.transactions.length || 0} transaksi
              </strong>
            </div>
            {validatedData?.exported_at && (
              <div className="flex justify-between">
                <span className="text-[#88839A]">Waktu cadangan:</span>
                <span className="text-[#27243A]">
                  {new Date(validatedData.exported_at).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-[#27243A] uppercase tracking-wider mb-2">
              Pilih Mode Restore
            </label>
            <div className="space-y-2.5">
              {/* Option 1: Merge */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  restoreMode === 'merge'
                    ? 'border-[#7C3AED] bg-[#EDE9FE]/30 ring-1 ring-[#7C3AED]'
                    : 'border-[#EEEAF7] bg-white hover:bg-[#FAF9FF]'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="mt-0.5 text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <div>
                  <span className="text-xs font-bold text-[#27243A] block">
                    1. Gabungkan Data (Disarankan)
                  </span>
                  <span className="text-[11px] text-[#88839A] leading-normal block mt-0.5">
                    Menambahkan transaksi baru dari file tanpa menghapus transaksi yang sudah ada. Transaksi dengan ID yang sama otomatis dilewati untuk menghindari duplikasi.
                  </span>
                </div>
              </label>

              {/* Option 2: Replace */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  restoreMode === 'replace'
                    ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500'
                    : 'border-[#EEEAF7] bg-white hover:bg-[#FAF9FF]'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-rose-600 block">
                    2. Ganti Semua Data
                  </span>
                  <span className="text-[11px] text-[#88839A] leading-normal block mt-0.5">
                    Menghapus seluruh transaksi yang saat ini ada di aplikasi dan menggantikannya sepenuhnya dengan data dari file backup.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Warning banner for Replace mode */}
          {restoreMode === 'replace' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>
                <strong>Peringatan Penting:</strong> Sebanyak <strong>{transactions.length}</strong> transaksi saat ini akan dihapus permanen dan digantikan oleh data file backup.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#EEEAF7]">
            <button
              type="button"
              onClick={() => {
                setIsRestoreModalOpen(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-[#88839A] hover:text-[#27243A] hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteRestore}
              disabled={isProcessing}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5 ${
                restoreMode === 'replace'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 shadow-purple-200'
              }`}
            >
              {isProcessing ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {restoreMode === 'replace' ? 'Ya, Ganti Semua Data' : 'Gabungkan Sekarang'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
