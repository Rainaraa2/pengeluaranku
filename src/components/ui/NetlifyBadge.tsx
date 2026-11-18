import React from 'react';
import { ExternalLink } from 'lucide-react';

export const NetlifyBadge: React.FC = () => {
  return (
    <aside
      aria-label="Informasi hosting aplikasi"
      className="fixed bottom-20 md:bottom-5 right-4 md:right-6 z-30 transition-all duration-200"
    >
      <a
        href="https://www.netlify.com"
        target="_blank"
        rel="noopener noreferrer"
        title="PengeluaranKu di-hosting dengan performa tinggi & SSL gratis di Netlify"
        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#EEEAF7] hover:border-[#DDD6FE] shadow-xs hover:shadow-md transition-all duration-200 text-[11px] text-[#88839A] hover:text-[#27243A] cursor-pointer"
      >
        {/* Status Dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C7B7] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C7B7]"></span>
        </span>

        {/* Netlify Clean Logo */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5 text-[#00C7B7] shrink-0 transition-transform group-hover:scale-110"
        >
          <path
            d="M6.4 16.9L2.8 12l3.6-4.9L12 3.5l5.6 3.6 3.6 4.9-3.6 4.9-5.6 3.6-5.6-3.6z"
            fill="#00C7B7"
            fillOpacity="0.2"
            stroke="#00C7B7"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 7.5L8.5 12l3.5 4.5 3.5-4.5L12 7.5z"
            fill="#00C7B7"
          />
        </svg>

        {/* Text */}
        <span className="tracking-tight">
          Powered by{' '}
          <strong className="font-bold text-[#00C7B7] group-hover:text-[#009b8e] transition-colors">
            Netlify
          </strong>
        </span>

        {/* Tiny External Link Icon */}
        <ExternalLink className="w-2.5 h-2.5 text-[#88839A] group-hover:text-[#00C7B7] transition-colors opacity-70 group-hover:opacity-100" />
      </a>
    </aside>
  );
};
