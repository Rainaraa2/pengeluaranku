import React from 'react';
import { Calendar, MonitorDown } from 'lucide-react';
import { MONTH_NAMES } from '../../utils/formatters';
import { AppLogo } from '../ui/AppLogo';

interface NavbarProps {
  currentTab: string;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  const now = new Date();
  const day = now.getDate();
  const monthName = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Pengeluaran';
      case 'tambah':
        return 'Tambah Pengeluaran';
      case 'riwayat':
        return 'Riwayat Transaksi';
      case 'laporan':
        return 'Laporan & Ringkasan';
      case 'pengaturan':
        return 'Pengaturan & Backup';
      default:
        return 'PengeluaranKu';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#DDD6FE] text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <AppLogo size={36} />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight drop-shadow-xs">
              PengeluaranKu
            </h1>
            <p className="text-xs text-white/80 hidden sm:block font-medium">
              {getPageTitle()}
            </p>
          </div>
        </div>

        {/* Right: Date badge and PWA Install CTA */}
        <div className="flex items-center gap-2.5">
          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="Pasang PengeluaranKu di Desktop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#7C3AED] hover:bg-[#FAF9FF] text-xs font-bold shadow-xs transition hover:scale-105 cursor-pointer"
            >
              <MonitorDown className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="hidden xs:inline sm:inline">Pasang di Desktop</span>
              <span className="inline xs:hidden sm:hidden">Pasang</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-white shadow-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{`${day} ${monthName} ${year}`}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
