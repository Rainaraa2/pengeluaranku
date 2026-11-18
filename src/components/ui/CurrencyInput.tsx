import React, { useState, useEffect } from 'react';
import { formatNumberOnly } from '../../utils/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  error,
  required = false,
  disabled = false,
  id,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value > 0 ? formatNumberOnly(value) : '');

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatNumberOnly(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const num = parseInt(rawVal, 10);
    setDisplayValue(formatNumberOnly(num));
    onChange(num);
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-sm font-semibold text-[#88839A] select-none pointer-events-none">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pl-11 pr-4 py-2.5 text-base font-semibold text-[#27243A] bg-white border rounded-xl outline-hidden transition placeholder:text-gray-300 placeholder:font-normal focus:ring-2 focus:ring-[#A78BFA]/30 ${
            error
              ? 'border-rose-400 focus:border-rose-500'
              : 'border-[#EEEAF7] focus:border-[#A78BFA]'
          } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};
