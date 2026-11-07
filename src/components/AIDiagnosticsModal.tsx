import React, { useState } from 'react';
import { api } from '../api';
import { Cpu, Loader2, Sparkles, AlertCircle, Wrench, ArrowRight } from 'lucide-react';
import { SparePart } from '../types';

interface AIDiagnosticsModalProps {
  onSelectPart: (part: SparePart) => void;
  onFilterCategory?: (category: string) => void;
}

export const AIDiagnosticsModal: React.FC<AIDiagnosticsModalProps> = ({ onFilterCategory }) => {
  const [phoneBrand, setPhoneBrand] = useState('Apple');
  const [phoneModel, setPhoneModel] = useState('iPhone 15 Pro');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.diagnoseIssue(symptoms, phoneBrand, phoneModel);
      setDiagnosisResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to complete diagnosis.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleSymptoms = [
    'Screen flickers green and touch stops working randomly',
    'Phone drains battery fast and gets hot near charging port',
    'No network signal and Wi-Fi button greyed out after drop',
    'Camera screen is totally black or vibrates violently'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Smart Hardware Fault AI Diagnostic Assistant
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Describe smartphone failure symptoms to get AI-recommended spare parts to inspect & replace.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Brand
            </label>
            <select
              value={phoneBrand}
              onChange={e => setPhoneBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Apple">Apple iPhone</option>
              <option value="Samsung">Samsung Galaxy</option>
              <option value="Xiaomi">Xiaomi / Redmi</option>
              <option value="Realme">Realme</option>
              <option value="Vivo">Vivo</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Google Pixel">Google Pixel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Phone Model
            </label>
            <input
              type="text"
              value={phoneModel}
              onChange={e => setPhoneModel(e.target.value)}
              placeholder="e.g. Galaxy S24 Ultra or iPhone 14 Pro"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Describe Fault Symptoms & Physical Issues
          </label>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={4}
            placeholder="Describe what's happening (e.g. Screen turned black after drop, charging icon shows but battery drops 1% every minute, no audio during calls)..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Quick Sample Triggers */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
            Quick Diagnostic Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleSymptoms.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSymptoms(sample)}
                className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !symptoms.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Fault Telemetry with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Hardware Diagnosis</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {diagnosisResult && (
        <div className="p-5 bg-indigo-950 text-white rounded-xl border border-indigo-800 shadow-inner space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2">
            <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              AI Technical Recommendation for {phoneBrand} {phoneModel}
            </span>
          </div>

          <div className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans">
            {diagnosisResult}
          </div>

          <div className="pt-2 border-t border-indigo-800/80 flex justify-end">
            <button
              onClick={() => onFilterCategory && onFilterCategory('All')}
              className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Browse Catalog for Parts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
