import React from 'react';
import { Smartphone, Layers, Check } from 'lucide-react';

interface BrandSlotsProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  brandCounts: Record<string, number>;
}

const BRANDS = [
  { id: 'All', name: 'All Brands', color: 'from-slate-700 to-slate-900', subtitle: 'Universal Catalog' },
  { id: 'Apple', name: 'Apple', color: 'from-slate-800 to-slate-950', subtitle: 'iPhone 11 - 15 Pro Max' },
  { id: 'Samsung', name: 'Samsung', color: 'from-blue-600 to-indigo-900', subtitle: 'Galaxy S & Z Fold Series' },
  { id: 'Xiaomi', name: 'Xiaomi', color: 'from-orange-500 to-red-700', subtitle: 'Xiaomi & Redmi Series' },
  { id: 'Realme', name: 'Realme', color: 'from-amber-400 to-yellow-600', subtitle: 'GT & Number Series' },
  { id: 'Vivo', name: 'Vivo', color: 'from-blue-500 to-cyan-700', subtitle: 'X & V Camera Series' },
  { id: 'OnePlus', name: 'OnePlus', color: 'from-red-600 to-rose-900', subtitle: 'Nord & Flagship Series' },
  { id: 'Google Pixel', name: 'Google Pixel', color: 'from-emerald-600 to-teal-800', subtitle: 'Tensor G1 - G3 Series' },
];

export const BrandSlots: React.FC<BrandSlotsProps> = ({
  selectedBrand,
  onSelectBrand,
  brandCounts,
}) => {
  return (
    <section className="w-full my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Brand Slots & Dedicated Directories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a dedicated phone brand slot to filter genuine screens, batteries, motherboards, & cameras
          </p>
        </div>
        {selectedBrand !== 'All' && (
          <button
            onClick={() => onSelectBrand('All')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear Brand Filter
          </button>
        )}
      </div>

      {/* Grid of Dedicated Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BRANDS.map(brand => {
          const isSelected = selectedBrand === brand.id;
          const count = brand.id === 'All' 
            ? Object.values(brandCounts).reduce((a, b) => a + b, 0)
            : (brandCounts[brand.id] || 0);

          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand.id)}
              className={`relative p-3.5 rounded-xl text-left transition-all duration-200 border overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              {/* Top Row: Icon / Counter */}
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${brand.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                  {brand.id === 'All' ? <Layers className="w-4 h-4" /> : brand.name.substring(0, 2).toUpperCase()}
                </div>
                <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className={`text-xs font-extrabold truncate ${
                  isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'
                }`}>
                  {brand.name}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
                  {brand.subtitle}
                </p>
              </div>

              {/* Selected check indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
