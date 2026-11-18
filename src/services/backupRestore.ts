import { Transaction, BackupData, EXPENSE_CATEGORIES } from '../types';
import { db } from '../database/db';
import { getTodayDateString } from '../utils/formatters';

export function createBackupJson(transactions: Transaction[]): void {
  const today = getTodayDateString();
  const filename = `Backup_Pengeluaran_${today}.json`;

  const backupPayload: BackupData = {
    version: '1.0',
    appName: 'PengeluaranKu',
    exported_at: new Date().toISOString(),
    total_transactions: transactions.length,
    transactions: transactions.map((t) => ({
      id: t.id,
      nama_barang: t.nama_barang,
      tanggal: t.tanggal,
      kategori: t.kategori,
      jumlah: Number(t.jumlah),
      keterangan: t.keterangan || '',
      created_at: t.created_at || Date.now(),
      updated_at: t.updated_at || Date.now(),
    })),
  };

  const jsonString = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  data?: BackupData;
}

export function validateBackupJsonString(jsonContent: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonContent);

    // Check root structure
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, errorMessage: 'File bukan objek JSON yang valid.' };
    }

    // Check version and transactions array
    if (!Array.isArray(parsed.transactions)) {
      return { isValid: false, errorMessage: 'Format backup tidak valid: properti "transactions" tidak ditemukan atau bukan array.' };
    }

    // Verify transactions
    for (let i = 0; i < parsed.transactions.length; i++) {
      const item = parsed.transactions[i];
      if (!item || typeof item !== 'object') {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} tidak valid.` };
      }

      if (!item.id || typeof item.id !== 'string') {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} tidak memiliki ID string yang valid.` };
      }

      if (!item.nama_barang || typeof item.nama_barang !== 'string' || item.nama_barang.trim() === '') {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} (${item.id}) nama barang kosong.` };
      }

      if (!item.tanggal || typeof item.tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.tanggal)) {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} (${item.nama_barang}) tanggal tidak berformat YYYY-MM-DD.` };
      }

      if (!item.kategori || !EXPENSE_CATEGORIES.includes(item.kategori)) {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} (${item.nama_barang}) memiliki kategori tidak valid: ${item.kategori}.` };
      }

      if (typeof item.jumlah !== 'number' || isNaN(item.jumlah) || item.jumlah <= 0) {
        return { isValid: false, errorMessage: `Transaksi ke-${i + 1} (${item.nama_barang}) nominal harus berupa angka lebih besar dari 0.` };
      }
    }

    return {
      isValid: true,
      data: parsed as BackupData,
    };
  } catch (err: any) {
    return {
      isValid: false,
      errorMessage: `Gagal membaca file JSON: ${err.message || 'Format rusak.'}`,
    };
  }
}

export async function restoreReplaceAll(transactions: Transaction[]): Promise<number> {
  return await db.replaceAll(transactions);
}

export async function restoreMerge(transactions: Transaction[]): Promise<{ added: number; skipped: number }> {
  return await db.mergeTransactions(transactions);
}
