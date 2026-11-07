import React, { useState } from 'react';
import { SparePart } from '../types';
import { Sparkles, Eye, CheckCircle2, AlertTriangle, PackageCheck } from 'lucide-react';

interface PartCardProps {
  part: SparePart;
  onSelectPart: (part: SparePart) => void;
  onCheckAI: (part: SparePart) => void;
}

export const PartCard: React.FC<PartCardProps> = ({
  part,
  onSelectPart,
  onCheckAI,
}) => {
  const [imgError, setImgError] = useState(false);

  const isLowStock = part.stock > 0 && part.stock < 5;
  const isOutOfStock = part.stock <= 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {!imgError ? (
          <img
            src={part.imageUrl}
            alt={part.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300">
            <PackageCheck className="w-10 h-10 text-indigo-400 mb-2 opacity-80" />
            <span className="text-xs font-bold text-center">{part.brand} {part.category}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1">{part.sku}</span>
          </div>
        )}

        {/* Quality Grade Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/10">
          {part.qualityGrade}
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Only {part.stock} left
            </span>
          ) : (
            <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              In Stock ({part.stock})
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Unboxed Metadata Line */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{part.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{part.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{part.sku}</span>
          </div>

          {/* Part Title */}
          <h3
            onClick={() => onSelectPart(part)}
            className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug"
          >
            {part.name}
          </h3>

          {/* Compatible Models Tags */}
          <div className="mt-2.5 flex flex-wrap gap-1">
            {part.compatibleModels.slice(0, 3).map((model, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
              >
                {model}
              </span>
            ))}
            {part.compatibleModels.length > 3 && (
              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                +{part.compatibleModels.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer Price & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Dealer Price</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              ₹{part.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onCheckAI(part)}
              className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              title="AI Compatibility & Fitment Checker"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectPart(part)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white text-xs font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Specs</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
