export type ExpenseCategory =
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Pendidikan'
  | 'Kebutuhan Harian'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Tagihan'
  | 'Belanja'
  | 'Lainnya';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Pendidikan',
  'Kebutuhan Harian',
  'Hiburan',
  'Kesehatan',
  'Tagihan',
  'Belanja',
  'Lainnya',
];

export interface Transaction {
  id: string; // unique string id
  nama_barang: string;
  tanggal: string; // format YYYY-MM-DD
  kategori: ExpenseCategory;
  jumlah: number;
  keterangan: string;
  created_at: number; // timestamp ms
  updated_at: number; // timestamp ms
}

export type SortOption = 'terbaru' | 'terlama' | 'terbesar' | 'terkecil';

export interface HistoryFilterState {
  searchQuery: string;
  month: number | 'ALL'; // 0-11 or 'ALL'
  year: number | 'ALL';
  category: ExpenseCategory | 'ALL';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  minAmount: number | '';
  maxAmount: number | '';
  sortBy: SortOption;
}

export interface BackupData {
  version: string;
  appName: string;
  exported_at: string;
  total_transactions: number;
  transactions: Transaction[];
}

export type NavigationTab = 'dashboard' | 'tambah' | 'riwayat' | 'laporan' | 'pengaturan';
