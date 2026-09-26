import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { PRODUCT_CATEGORIES } from '../data/defaultProducts';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Play, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';

interface PublicHomeProps {
  products: Product[];
  onLaunchDemo: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onRequestAccess: (product: Product) => void;
  onRequireLogin: () => void;
  onOpenClientPortal: () => void;
  isAuthenticated: boolean;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  products,
  onLaunchDemo,
  onViewDetails,
  onRequestAccess,
  onRequireLogin,
  onOpenClientPortal,
  isAuthenticated
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqs = [
    {
      q: 'How does the WebCraft Goods Demo Showcase work?',
      a: 'Authorized clients receive private credentials configured by the administrator. Once logged in, you can launch full-width interactive demonstrations of our digital planners, financial sheets, and productivity software for the allocated duration.'
    },
    {
      q: 'Can I test features, add sample entries, and customize the planners during my demo?',
      a: 'Yes! Every interactive demo runs in an isolated, sandboxed environment. You can check off habits, adjust budgets, schedule time blocks, and test features with 100% realistic responsiveness.'
    },
    {
      q: 'What happens when my demo countdown timer reaches zero?',
      a: 'Once your session duration expires, the active demonstration viewer safely closes. You can request additional evaluation time directly through the portal, or purchase the permanent edition with lifetime access on our Etsy store.'
    },
    {
      q: 'Do I need to install any software or extensions to run these tools?',
      a: 'No installation required! WebCraft Goods tools are standalone HTML applications that execute cleanly in any modern web browser across desktop computers, laptops, iPads, and mobile tablets.'
    },
    {
      q: 'Where can I purchase the permanent, un-timed edition of these planners?',
      a: 'Every product card and details page includes direct links to our official Etsy listings and store, where you receive the instant download package with full lifetime access.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Interactive Digital Goods</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Explore WebCraft Goods — <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 bg-clip-text text-transparent">
                Premium Interactive
              </span>{' '}
              Digital Tools
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Discover professional HTML planners, trackers, dashboards, and business management applications. Explore interactive product demonstrations through our secure client showcase.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="#catalog"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Browse Products</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              {isAuthenticated ? (
                <button
                  onClick={onOpenClientPortal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Enter Client Portal</span>
                </button>
              ) : (
                <button
                  onClick={onRequireLogin}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Client Login</span>
                </button>
              )}
            </div>

            {/* Trust highlights */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Timed Client Demos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Isolated Sandboxed Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Installation Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Our Digital Suite
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click any tool to inspect modules or launch a full-screen interactive test demo.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search planners, trackers, tools..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onLaunchDemo={onLaunchDemo}
                onViewDetails={onViewDetails}
                onRequestAccess={onRequestAccess}
                onRequireLogin={onRequireLogin}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No matching products found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching for different keywords or select "All Categories".
            </p>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Seamless Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              How the Showcase Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Experience the power of real interactive HTML tools before making a purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Receive Client Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The administrator sets up an authorized client account with tailored demo durations (e.g. 15, 30, or 60 minutes) and assigns product access permissions.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Launch Full-Width HTML Demo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Launch the application in our sandboxed full-width viewer. Test time blocks, calculate budgets, and interact with real components in real time.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Buy Permanent Edition
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ready to make it part of your daily workflow? One-click links take you directly to our official Etsy store for instant download of the permanent un-timed files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Advantage Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-300">
              Why HTML Tools Beat Static PDFs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Interactive Logic, Instant Calculations & Zero Lag
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Unlike static PDF templates that require heavy annotation apps, WebCraft Goods products feature dynamic JavaScript calculations, time blockers, automated totals, and printable styling built right into the code.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Works 100% in Browser</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Responsive & Fluid</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Clean Print Formatting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white gap-4"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              WG
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                WebCraft Goods
              </span>
              <p className="text-[11px] text-slate-400">
                Interactive Digital Products & Planners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="https://www.etsy.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
              <span>Etsy Shop</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>support@webcraftgoods.com</span>
            <span>© 2026 WebCraft Goods. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
