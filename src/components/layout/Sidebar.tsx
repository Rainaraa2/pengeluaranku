import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Settings,
  MonitorDown,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { AppLogo } from '../ui/AppLogo';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  totalTransactionsCount?: number;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  totalTransactionsCount = 0,
  onOpenInstallModal,
  isInstalled = false,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tambah', label: 'Tambah Pengeluaran', icon: PlusCircle },
    { id: 'riwayat', label: 'Riwayat', icon: History, badge: totalTransactionsCount },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#EEEAF7] shrink-0 min-h-[calc(100vh-4rem)] p-4">
      {/* Brand box */}
      <div className="flex items-center gap-3 px-3 py-3.5 mb-4 rounded-2xl bg-gradient-to-br from-[#FAF9FF] to-[#DDD6FE]/30 border border-[#EEEAF7]">
        <AppLogo size={40} />
        <div>
          <h2 className="font-bold text-sm text-[#27243A]">PengeluaranKu</h2>
          <p className="text-xs text-[#88839A]">Catatan Keuangan</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#EDE9FE] to-[#F5F3FF] text-[#7C3AED] shadow-xs border border-[#DDD6FE]/60'
                  : 'text-[#88839A] hover:text-[#27243A] hover:bg-[#FAF9FF]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#7C3AED]' : 'text-[#88839A]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-[#DDD6FE] text-[#6D28D9]'
                      : 'bg-[#FAF9FF] text-[#88839A] border border-[#EEEAF7]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Desktop PWA Install CTA + Quick Add */}
      <div className="mt-auto space-y-2.5">
        {!isInstalled && onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-full p-2.5 rounded-xl bg-white hover:bg-[#FAF9FF] border border-[#DDD6FE] text-xs font-bold text-[#7C3AED] flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer group"
          >
            <MonitorDown className="w-4 h-4 text-[#7C3AED] group-hover:translate-y-0.5 transition-transform" />
            <span>Pasang di Desktop</span>
          </button>
        )}

        {/* Quick Add CTA Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE]/50 text-center">
          <p className="text-xs font-medium text-[#7C3AED] mb-2">Punya pengeluaran baru?</p>
          <button
            onClick={() => onTabChange('tambah')}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-300 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Sekarang</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
