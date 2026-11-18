import React from 'react';
import { ExpenseCategory } from '../../types';
import { CATEGORY_CONFIG } from '../../utils/formatters';
import {
  UtensilsCrossed,
  Car,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  ReceiptText,
  Shirt,
  MoreHorizontal,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: ExpenseCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
}) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Lainnya'];

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (category) {
      case 'Makanan & Minuman':
        return <UtensilsCrossed size={iconSize} />;
      case 'Transportasi':
        return <Car size={iconSize} />;
      case 'Pendidikan':
        return <GraduationCap size={iconSize} />;
      case 'Kebutuhan Harian':
        return <ShoppingBag size={iconSize} />;
      case 'Hiburan':
        return <Gamepad2 size={iconSize} />;
      case 'Kesehatan':
        return <HeartPulse size={iconSize} />;
      case 'Tagihan':
        return <ReceiptText size={iconSize} />;
      case 'Belanja':
        return <Shirt size={iconSize} />;
      default:
        return <MoreHorizontal size={iconSize} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border transition ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderColor: config.borderColor,
      }}
    >
      {showIcon && <span style={{ color: config.color }}>{renderIcon()}</span>}
      <span>{category}</span>
    </span>
  );
};
