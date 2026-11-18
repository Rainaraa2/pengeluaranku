import React from 'react';
import { Modal } from './Modal';
import { Monitor, Smartphone, Download, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => void;
  isInstallable: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pasang PengeluaranKu di Desktop" maxWidth="md">
      <div className="space-y-5">
        {/* App Logo & Header Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE]">
          <AppLogo size={56} className="rounded-2xl shadow-md border-2 border-white shrink-0" />
          <div>
            <h4 className="font-bold text-base text-[#27243A]">PengeluaranKu Desktop App</h4>
            <p className="text-xs text-[#88839A] leading-relaxed">
              Buka aplikasi langsung dari icon Desktop tanpa harus mengetik URL di browser.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#27243A]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ikon logo resmi tampil di Desktop & Start Menu komputer</span>
          </div>
          <div className="flex items-center gap-2 text-[#27243A]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Terbuka instan dalam jendela aplikasi bersih tanpa address bar</span>
          </div>
          <div className="flex items-center gap-2 text-[#27243A]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mendukung mode offline & penyimpanan data IndexedDB persisten</span>
          </div>
        </div>

        {/* Action Button if direct prompt is supported */}
        {isInstallable && (
          <button
            onClick={() => {
              onTriggerInstall();
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-300 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Pasang Sekarang ke Desktop</span>
          </button>
        )}

        {/* Manual Instructions for Desktop & Mobile */}
        <div className="pt-3 border-t border-[#EEEAF7] space-y-3">
          <h5 className="text-xs font-bold text-[#88839A] uppercase tracking-wider">
            Panduan Pemasangan Manual:
          </h5>

          {/* Desktop Chrome / Edge */}
          <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#27243A]">
              <Monitor className="w-4 h-4 text-[#7C3AED]" />
              <span>Di Komputer / Desktop (Chrome / Edge / Brave):</span>
            </div>
            <ol className="list-decimal list-inside text-[#88839A] space-y-1 pl-1">
              <li>Lihat di sebelah kanan kolom URL / address bar browser Anda.</li>
              <li>Klik ikon komputer kecil dengan tanda panah ke bawah (<strong>Install / Pasang</strong>).</li>
              <li>Klik tombol <strong>Install</strong> pada pop-up konfirmasi.</li>
              <li>Ikon <strong>PengeluaranKu</strong> akan langsung muncul di Desktop & Taskbar!</li>
            </ol>
          </div>

          {/* Smartphone / Mobile */}
          <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EEEAF7] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#27243A]">
              <Smartphone className="w-4 h-4 text-[#7C3AED]" />
              <span>Di HP (Android / iPhone):</span>
            </div>
            <p className="text-[#88839A]">
              Buka menu browser (ikon titik tiga atau tombol Share di Safari), lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>).
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#88839A] hover:text-[#27243A] hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
