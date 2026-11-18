import { ExpenseCategory } from '../types';

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format number to Indonesian Rupiah (e.g. Rp 25.000)
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('IDR', 'Rp').trim();
}

/**
 * Format number with thousand separator (e.g. 25.000)
 */
export function formatNumberOnly(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse string into positive number (strips Rp, spaces, dots)
 */
export function parseRupiahInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format YYYY-MM-DD to Indonesian readable date e.g. "18 November 2026"
 */
export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `${day} ${MONTH_NAMES[monthIdx] || ''} ${year}`;
  }
  return dateStr;
}

/**
 * Category color definitions following the soft lilac/lavender/purple palette
 */
export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  {
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    iconName: string;
  }
> = {
  'Makanan & Minuman': {
    color: '#7C3AED', // Deep Purple
    bgColor: '#F3E8FF',
    textColor: '#6B21A8',
    borderColor: '#E9D5FF',
    iconName: 'UtensilsCrossed',
  },
  'Transportasi': {
    color: '#A78BFA', // Lilac Utama
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    borderColor: '#DDD6FE',
    iconName: 'Car',
  },
  'Pendidikan': {
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
    textColor: '#6D28D9',
    borderColor: '#DDD6FE',
    iconName: 'GraduationCap',
  },
  'Kebutuhan Harian': {
    color: '#6366F1', // Indigo soft
    bgColor: '#EEF2FF',
    textColor: '#4338CA',
    borderColor: '#E0E7FF',
    iconName: 'ShoppingBag',
  },
  'Hiburan': {
    color: '#EC4899', // Pink lilac
    bgColor: '#FDF2F8',
    textColor: '#BE185D',
    borderColor: '#FCE7F3',
    iconName: 'Gamepad2',
  },
  'Kesehatan': {
    color: '#0D9488', // Teal accent
    bgColor: '#CCFBF1',
    textColor: '#0F766E',
    borderColor: '#99F6E4',
    iconName: 'HeartPulse',
  },
  'Tagihan': {
    color: '#D97706', // Warm amber
    bgColor: '#FEF3C7',
    textColor: '#B45309',
    borderColor: '#FDE68A',
    iconName: 'ReceiptText',
  },
  'Belanja': {
    color: '#C084FC', // Light purple
    bgColor: '#FAF5FF',
    textColor: '#7E22CE',
    borderColor: '#F3E8FF',
    iconName: 'Shirt',
  },
  'Lainnya': {
    color: '#64748B', // Slate
    bgColor: '#F1F5F9',
    textColor: '#334155',
    borderColor: '#E2E8F0',
    iconName: 'MoreHorizontal',
  },
};

/**
 * Palette colors for Recharts pie and charts
 */
export const CHART_PALETTE = [
  '#7C3AED', // Deep Purple
  '#A78BFA', // Lilac Utama
  '#8B5CF6', // Purple
  '#C4B5FD', // Lilac Lembut
  '#6366F1', // Indigo soft
  '#DDD6FE', // Lavender
  '#9333EA', // Rich purple
  '#A855F7', // Magenta purple
  '#64748B', // Slate
];

/**
 * Get today's date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
