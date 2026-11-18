import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA] border border-white/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 text-white drop-shadow-xs"
      >
        {/* Wallet shape */}
        <rect
          x="2"
          y="6"
          width="20"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Card sticking out */}
        <path
          d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Wallet clasp */}
        <rect
          x="14"
          y="11"
          width="6"
          height="4"
          rx="1"
          fill="currentColor"
        />
        <circle cx="16.5" cy="13" r="0.75" fill="#7C3AED" />
      </svg>
    </div>
  );
};
