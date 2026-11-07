import React, { useState } from 'react';
import { SparePart } from '../types';
import { api } from '../api';
import { X, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Wrench, Loader2 } from 'lucide-react';

interface PartDetailModalProps {
  part: SparePart | null;
  onClose: () => void;
}

export const PartDetailModal: React.FC<PartDetailModalProps> = ({ part, onClose }) => {
  if (!part) return null;

  const [targetModel, setTargetModel] = useState(part.compatibleModels[0] || '');
  const [issueNotes, setIssueNotes] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleRunAICheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModel.trim()) return;

    setIsLoadingAI(true);
    setAiError(null);
    try {
      const result = await api.checkAICompatibility(part.name, part.brand, targetModel, issueNotes);
      setAiAnalysis(result);
    } catch (err: any) {
      setAiError(err.message || 'AI Compatibility service encountered an error.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
              {part.brand} Spare Part
            </span>
            <span className="text-xs font-mono text-slate-400">SKU: {part.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src={part.imageUrl}
                alt={part.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Details */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {part.category} · {part.qualityGrade}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {part.name}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {part.description}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Dealer Wholesale Price</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    ₹{part.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Inventory Stock</span>
                  <span className={`text-sm font-bold ${part.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {part.stock > 0 ? `${part.stock} Units Available` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Install difficulty & Grade */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold">INSTALLATION DIFFICULTY</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    {part.installationDifficulty} Level
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold">QUALITY GUARANTEE</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Tested & Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Technical Specifications & Key Hardware Parameters
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(part.specifications || {}).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-950' : 'bg-white dark:bg-slate-900'}
                    >
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 w-1/3">
                        {key}
                      </td>
                      <td className="p-3 font-mono text-slate-900 dark:text-white">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compatible Phone Models */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Compatible Smartphone Models & Revision Codes
            </h3>
            <div className="flex flex-wrap gap-2">
              {part.compatibleModels.map((m, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-lg text-xs font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* AI Fitment & Compatibility Assistant Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  AI Fitment & Pinout Compatibility Evaluator
                </h3>
                <p className="text-xs text-indigo-200">
                  Powered by Server-Side Gemini AI Engine. Test compatibility with custom variant phone models.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunAICheck} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-indigo-200 font-medium block mb-1">
                    Target Phone Model Variant
                  </label>
                  <input
                    type="text"
                    value={targetModel}
                    onChange={e => setTargetModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro Max A3106"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-indigo-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-indigo-200 font-medium block mb-1">
                    Fault Symptom / Additional Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={issueNotes}
                    onChange={e => setIssueNotes(e.target.value)}
                    placeholder="e.g. Display backlight working but no touch"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-indigo-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoadingAI}
                className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Pinout & Connector Schematic...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Run AI Fitment Analysis</span>
                  </>
                )}
              </button>
            </form>

            {aiError && (
              <div className="p-3 bg-rose-900/60 border border-rose-500/40 rounded-lg text-xs text-rose-200">
                {aiError}
              </div>
            )}

            {aiAnalysis && (
              <div className="p-4 bg-slate-950/90 border border-indigo-500/40 rounded-xl text-xs space-y-2">
                <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[10px]">
                  Gemini Technical Fitment Report
                </span>
                <div className="whitespace-pre-wrap text-slate-200 leading-relaxed font-sans">
                  {aiAnalysis}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
