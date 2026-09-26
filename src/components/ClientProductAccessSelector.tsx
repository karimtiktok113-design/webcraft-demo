import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Check, Globe, Package, CheckSquare, Square, Filter } from 'lucide-react';

interface ClientProductAccessSelectorProps {
  products: Product[];
  allowedProductIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const ClientProductAccessSelector: React.FC<ClientProductAccessSelectorProps> = ({
  products,
  allowedProductIds,
  onChange,
  className = ''
}) => {
  const isWholeCatalog = allowedProductIds.includes('*');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleToggleWholeCatalog = (whole: boolean) => {
    if (whole) {
      onChange(['*']);
    } else {
      // Default to all current products if transitioning from whole catalog
      onChange(products.map(p => p.id));
    }
  };

  const handleToggleProduct = (productId: string) => {
    let current = isWholeCatalog ? products.map(p => p.id) : [...allowedProductIds];
    if (current.includes(productId)) {
      current = current.filter(id => id !== productId);
    } else {
      current = [...current, productId];
    }
    onChange(current);
  };

  const handleSelectAll = () => {
    onChange(products.map(p => p.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedCount = isWholeCatalog ? products.length : allowedProductIds.filter(id => products.some(p => p.id === id)).length;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Digital Products Authorization
        </label>
        <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
          {isWholeCatalog ? `Whole Catalog (${products.length} tools)` : `${selectedCount} of ${products.length} selected`}
        </span>
      </div>

      {/* Access Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => handleToggleWholeCatalog(true)}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            isWholeCatalog
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Whole Catalog ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggleWholeCatalog(false)}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            !isWholeCatalog
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Custom Selection</span>
        </button>
      </div>

      {isWholeCatalog ? (
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Full Catalog Access Granted (Universal Whitelist)</p>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
              This client can launch and evaluate all current digital products ({products.length} available) as well as any future products added to the store catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tools by title..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/30">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No digital products match filter.</p>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = allowedProductIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleToggleProduct(p.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {p.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">
                          {p.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {p.price && (
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {p.price}
                        </span>
                      )}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
