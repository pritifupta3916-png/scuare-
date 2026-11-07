import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BrandSlots } from './components/BrandSlots';
import { PartCard } from './components/PartCard';
import { PartDetailModal } from './components/PartDetailModal';
import { AIDiagnosticsModal } from './components/AIDiagnosticsModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { api } from './api';
import { User, SparePart, Category } from './types';
import { Search, Filter, SlidersHorizontal, Package, RefreshCw, X, ShieldAlert, Sparkles, Layers } from 'lucide-react';

const CATEGORIES: { name: string; id: Category | 'All' }[] = [
  { name: 'All Categories', id: 'All' },
  { name: 'Screens & Digitizers', id: 'Screens' },
  { name: 'Batteries & Cells', id: 'Batteries' },
  { name: 'Camera Modules', id: 'Camera Modules' },
  { name: 'Charging Ports & Docks', id: 'Charging Ports' },
  { name: 'Motherboards & Logic Boards', id: 'Motherboards' },
  { name: 'Flex Cables', id: 'Flex Cables' },
  { name: 'Speakers & Mics', id: 'Speakers & Microphones' },
  { name: 'Back Glasses & Frames', id: 'Back Glasses & Housings' },
];

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'admin' | 'ai-diagnostics'>('catalog');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [selectedPartForDetail, setSelectedPartForDetail] = useState<SparePart | null>(null);

  // Catalog Filters State
  const [parts, setParts] = useState<SparePart[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(600);

  const [isLoadingParts, setIsLoadingParts] = useState(true);
  const logDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Apply Tailwind dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check current user on mount
  useEffect(() => {
    api.getMe().then(user => {
      if (user) {
        setCurrentUser(user);
        if (user.role === 'DEVELOPER/ADMIN') {
          setActiveTab('admin');
        }
      }
    });

    api.getBrands().then(brands => {
      const map: Record<string, number> = {};
      brands.forEach(b => { map[b.name] = b.count; });
      setBrandCounts(map);
    });
  }, []);

  // Fetch Parts when filters change
  const fetchParts = async () => {
    setIsLoadingParts(true);
    try {
      const result = await api.getParts({
        query: searchQuery,
        brand: selectedBrand,
        category: selectedCategory,
        maxPrice: maxPriceFilter < 600 ? maxPriceFilter : undefined,
        inStock: inStockOnly,
        sort: sortOption,
      });
      setParts(result);

      // Debounced search activity logging
      if (searchQuery.trim().length > 2) {
        if (logDebounceRef.current) clearTimeout(logDebounceRef.current);
        logDebounceRef.current = setTimeout(() => {
          api.logSearch({
            query: searchQuery,
            brandFilter: selectedBrand,
            categoryFilter: selectedCategory,
            resultsCount: result.length,
          });
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to load parts:', err);
    } finally {
      setIsLoadingParts(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [searchQuery, selectedBrand, selectedCategory, inStockOnly, sortOption, maxPriceFilter]);

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    if (user.role === 'DEVELOPER/ADMIN' || user.phone === '7985114480') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mobilix_auth_token');
    setCurrentUser(null);
    setActiveTab('catalog');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 1-Row 3-Zone Top Navigation Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: DEVELOPER / ADMIN DASHBOARD */}
        {activeTab === 'admin' && currentUser && currentUser.role === 'DEVELOPER/ADMIN' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
          />
        )}

        {/* VIEW 2: AI HARDWARE DIAGNOSTICS TOOL */}
        {activeTab === 'ai-diagnostics' && (
          <AIDiagnosticsModal
            onSelectPart={part => setSelectedPartForDetail(part)}
            onFilterCategory={cat => {
              setSelectedCategory(cat as any);
              setActiveTab('catalog');
            }}
          />
        )}

        {/* VIEW 3: SPARE PARTS CATALOG & BRAND DIRECTORY */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            
            {/* Hero Search Section */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-time Mobile Spare Parts Search & User Activity Console</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Mobile Spare Parts Directory & Replacement Hub
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Search genuine screens, high-capacity batteries, camera modules, charging dock ICs, and logic boards across top smartphone manufacturers.
                </p>

                {/* Global Search Bar (Real-time Filtering & User Logging) */}
                <div className="pt-2">
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by part name, brand (Apple, Samsung...), SKU, or model (e.g. iPhone 15 Pro, S24 Ultra)..."
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-950/80 border border-indigo-500/40 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Brand Slots Section */}
            <BrandSlots
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              brandCounts={brandCounts}
            />

            {/* Filter Toolbar (Category Tabs, Stock Toggle, Price Slider, Sort) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              {/* Category Segmented Controls (Fixed Flex Wrap Layout - No Horizontal Sliding) */}
              <div className="flex flex-wrap items-center gap-2 pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Secondary Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                
                {/* Active Filters Summary */}
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <span>Showing <strong className="text-slate-900 dark:text-white font-mono">{parts.length}</strong> spare parts</span>
                  {(selectedBrand !== 'All' || selectedCategory !== 'All' || searchQuery) && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                      · Filtered
                    </span>
                  )}
                </div>

                {/* Right Utilities: Stock Toggle, Max Price, Sort */}
                <div className="flex items-center gap-4 flex-wrap">
                  
                  {/* Stock Filter Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={e => setInStockOnly(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>In Stock Only</span>
                  </label>

                  {/* Price Slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Max Price:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{maxPriceFilter.toLocaleString('en-IN')}
                    </span>
                    <input
                      type="range"
                      min={100}
                      max={600}
                      step={10}
                      value={maxPriceFilter}
                      onChange={e => setMaxPriceFilter(Number(e.target.value))}
                      className="w-24 accent-indigo-600"
                    />
                  </div>

                  {/* Sort Select */}
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortOption}
                      onChange={e => setSortOption(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="featured">Featured First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name">Sort by Name</option>
                      <option value="stock">Stock Available</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>

            {/* Spare Parts Product Grid */}
            {isLoadingParts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : parts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Package className="w-12 h-12 text-slate-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No spare parts found matching your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing search filters or checking another brand slot (Apple, Samsung, Xiaomi, etc.).
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('All');
                    setSelectedCategory('All');
                    setInStockOnly(false);
                    setMaxPriceFilter(600);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {parts.map(part => (
                  <PartCard
                    key={part.id}
                    part={part}
                    onSelectPart={p => setSelectedPartForDetail(p)}
                    onCheckAI={p => setSelectedPartForDetail(p)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">MOBIL LIX PARTS</span> Mobile Spare Parts Directory & User Activity Management System
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              Database Schema Specification
            </button>
            <span>·</span>
            <span>BCrypt Hashing & RBAC Enforced</span>
            <span>·</span>
            <span>Developer Phone: 7985114480</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <PartDetailModal
        part={selectedPartForDetail}
        onClose={() => setSelectedPartForDetail(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

    </div>
  );
}
