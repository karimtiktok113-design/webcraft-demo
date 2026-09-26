import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductExternalLinks, ProductSandboxOptions } from '../types';
import { STARTER_TEMPLATES } from '../data/productTemplates';
import { 
  X, 
  Upload, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Eye, 
  Play, 
  Check, 
  Layers, 
  Globe, 
  Tag, 
  DollarSign, 
  Smartphone, 
  Monitor, 
  Tablet, 
  ShieldCheck, 
  Clock, 
  ShoppingBag, 
  Info, 
  Copy, 
  RotateCcw, 
  FileCode, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  initialProduct?: Product | null;
}

const CATEGORY_PRESETS = [
  'Productivity & Planning',
  'Agile & Sprint Management',
  'Finance & Accounting',
  'Inventory & Supply',
  'Health & Fitness',
  'Event & Experience',
  'Creative & Design',
  'Real Estate & CRM',
  'Education & Study',
  'Developer & IT Tools'
];

const BADGE_PRESETS = [
  'None',
  'Bestseller',
  'New Release',
  'Featured',
  'Staff Pick',
  'Pro Edition',
  'Limited Deal',
  'Client Favorite'
];

const DEVICE_OPTIONS = [
  'Desktop / Mac / PC',
  'iPad & Tablets',
  'Mobile Responsive',
  'Printable & PDF Export',
  'Offline Local Mode'
];

const SUGGESTED_FEATURES = [
  'Interactive Daily Tracking',
  'Live Automated Calculations',
  'Drag-and-Drop Organization',
  'Instant LocalStorage Persistence',
  'Print & PDF Ready Layouts',
  'Dark & Light Mode Responsive',
  'Custom Category Tagging',
  'Zero External Server Dependencies',
  'CSV Import & Data Export',
  'Keyboard Productivity Shortcuts'
];

const THUMBNAIL_PRESETS = [
  { label: 'Minimalist Planner', url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80' },
  { label: 'Agile Kanban', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { label: 'Finance & Ledger', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
  { label: 'Inventory & Storage', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Health & Wellness', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern Abstract', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80' }
];

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct
}) => {
  type ActiveTab = 'identity' | 'features' | 'links' | 'media' | 'sandbox' | 'html';
  const [activeTab, setActiveTab] = useState<ActiveTab>('identity');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Productivity & Planning');
  const [customCategory, setCustomCategory] = useState('');
  const [badge, setBadge] = useState('Featured');
  const [version, setVersion] = useState('v1.0.0');
  const [price, setPrice] = useState('$29.00');
  const [originalPrice, setOriginalPrice] = useState('$49.00');
  const [isPublished, setIsPublished] = useState(true);
  const [targetAudience, setTargetAudience] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['planner', 'productivity', 'digital-goods']);

  // Features
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [supportedDevices, setSupportedDevices] = useState<string[]>([
    'Desktop / Mac / PC',
    'iPad & Tablets',
    'Mobile Responsive'
  ]);

  // Links
  const [purchaseUrl, setPurchaseUrl] = useState('https://www.etsy.com');
  const [gumroadUrl, setGumroadUrl] = useState('');
  const [demoWebsiteUrl, setDemoWebsiteUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [supportUrl, setSupportUrl] = useState('');

  // Media
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotInput, setNewScreenshotInput] = useState('');

  // Sandbox Options
  const [suggestedDuration, setSuggestedDuration] = useState(15);
  const [allowStorageIsolation, setAllowStorageIsolation] = useState(true);
  const [enableResetButton, setEnableResetButton] = useState(true);
  const [customHeaderNote, setCustomHeaderNote] = useState('Sandboxed Client Origin • Isolated LocalStorage');
  const [demoInstructions, setDemoInstructions] = useState('');

  // HTML Source Code
  const [demoHtml, setDemoHtml] = useState('<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;"><h2>WebCraft Demo App</h2><p>Custom application payload running in sandboxed environment.</p></body></html>');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form on open or when initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title || '');
      setCategory(initialProduct.category || 'Productivity & Planning');
      setBadge(initialProduct.badge || 'Featured');
      setVersion(initialProduct.version || 'v1.0.0');
      setPrice(initialProduct.price || '$29.00');
      setOriginalPrice(initialProduct.originalPrice || '$49.00');
      setIsPublished(initialProduct.isPublished !== false);
      setTargetAudience(initialProduct.targetAudience || '');
      setShortDescription(initialProduct.shortDescription || '');
      setDescription(initialProduct.description || initialProduct.shortDescription || '');
      setTags(initialProduct.tags || ['planner', 'productivity']);
      setFeatures(initialProduct.features || []);
      setSupportedDevices(initialProduct.supportedDevices || ['Desktop / Mac / PC', 'iPad & Tablets']);
      setPurchaseUrl(initialProduct.purchaseUrl || 'https://www.etsy.com');
      setGumroadUrl(initialProduct.externalLinks?.gumroadUrl || '');
      setDemoWebsiteUrl(initialProduct.externalLinks?.demoWebsiteUrl || '');
      setDocsUrl(initialProduct.externalLinks?.docsUrl || '');
      setVideoUrl(initialProduct.externalLinks?.videoUrl || '');
      setSupportUrl(initialProduct.externalLinks?.supportUrl || '');
      setThumbnailUrl(initialProduct.thumbnailUrl || THUMBNAIL_PRESETS[0].url);
      setScreenshots(initialProduct.screenshots || []);
      setSuggestedDuration(initialProduct.sandboxOptions?.suggestedDurationMinutes || 15);
      setAllowStorageIsolation(initialProduct.sandboxOptions?.allowStorageIsolation !== false);
      setEnableResetButton(initialProduct.sandboxOptions?.enableResetButton !== false);
      setCustomHeaderNote(initialProduct.sandboxOptions?.customHeaderNote || 'Sandboxed Client Origin • Isolated LocalStorage');
      setDemoInstructions(initialProduct.demoInstructions || '');
      setDemoHtml(initialProduct.demoHtml || '');
    } else {
      // Default new product state
      setTitle('');
      setCategory('Productivity & Planning');
      setBadge('New Release');
      setVersion('v1.0.0');
      setPrice('$29.00');
      setOriginalPrice('$49.00');
      setIsPublished(true);
      setTargetAudience('Digital creators, freelancers & productivity enthusiasts');
      setShortDescription('');
      setDescription('');
      setTags(['planner', 'interactive', 'digital-goods']);
      setFeatures([
        'Interactive Daily Tracking Matrix',
        'Print & PDF Layout Compatibility',
        'Client-Side Sandboxed LocalStorage Persistence'
      ]);
      setSupportedDevices(['Desktop / Mac / PC', 'iPad & Tablets', 'Mobile Responsive']);
      setPurchaseUrl('https://www.etsy.com');
      setGumroadUrl('');
      setDemoWebsiteUrl('');
      setDocsUrl('');
      setVideoUrl('');
      setSupportUrl('');
      setThumbnailUrl(THUMBNAIL_PRESETS[0].url);
      setScreenshots([]);
      setSuggestedDuration(15);
      setAllowStorageIsolation(true);
      setEnableResetButton(true);
      setCustomHeaderNote('Sandboxed Client Origin • Isolated LocalStorage');
      setDemoInstructions('Click elements to test live reactivity. All changes are saved locally to your private session.');
      setDemoHtml(STARTER_TEMPLATES[0].htmlCode);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  // Features handlers
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures([...features, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleUpdateFeature = (idx: number, val: string) => {
    const updated = [...features];
    updated[idx] = val;
    setFeatures(updated);
  };

  const handleMoveFeature = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === features.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...features];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFeatures(copy);
  };

  const handleAddSuggestedFeature = (feat: string) => {
    if (!features.includes(feat)) {
      setFeatures([...features, feat]);
    }
  };

  // Device compatibility toggle
  const toggleDevice = (dev: string) => {
    if (supportedDevices.includes(dev)) {
      setSupportedDevices(supportedDevices.filter(d => d !== dev));
    } else {
      setSupportedDevices([...supportedDevices, dev]);
    }
  };

  // Tags handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Screenshots handlers
  const handleAddScreenshot = () => {
    if (!newScreenshotInput.trim()) return;
    setScreenshots([...screenshots, newScreenshotInput.trim()]);
    setNewScreenshotInput('');
  };

  const handleRemoveScreenshot = (idx: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== idx));
  };

  // File upload handler
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDemoHtml(content);
        setStatusMessage(`Loaded "${file.name}" (${(content.length / 1024).toFixed(1)} KB) successfully!`);
        setTimeout(() => setStatusMessage(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Apply template
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = STARTER_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;
    if (confirm(`Apply starter template "${tmpl.name}"? This updates the category, features, description, and source code.`)) {
      setTitle(prev => prev || tmpl.name);
      setCategory(tmpl.category);
      setShortDescription(tmpl.description);
      setDescription(tmpl.description);
      setBadge(tmpl.badge);
      setVersion(tmpl.version);
      setPrice(tmpl.price);
      setFeatures(tmpl.features);
      setDemoHtml(tmpl.htmlCode);
      setStatusMessage(`Template "${tmpl.name}" applied.`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Save product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Product title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCategory = category === 'Custom' ? customCategory || 'Custom Tool' : category;
      const finalId = initialProduct?.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${Date.now()}`;

      const externalLinks: ProductExternalLinks = {
        etsyUrl: purchaseUrl,
        ...(gumroadUrl ? { gumroadUrl } : {}),
        ...(demoWebsiteUrl ? { demoWebsiteUrl } : {}),
        ...(docsUrl ? { docsUrl } : {}),
        ...(videoUrl ? { videoUrl } : {}),
        ...(supportUrl ? { supportUrl } : {})
      };

      const sandboxOptions: ProductSandboxOptions = {
        allowStorageIsolation,
        enableResetButton,
        customHeaderNote,
        suggestedDurationMinutes: Number(suggestedDuration)
      };

      const productPayload: Product = {
        id: finalId,
        title: title.trim(),
        category: finalCategory,
        badge: badge === 'None' ? undefined : badge,
        price,
        originalPrice,
        shortDescription: shortDescription || `${title} interactive tool by WebCraft Goods.`,
        description: description || shortDescription || `${title} interactive digital tool.`,
        targetAudience: targetAudience || undefined,
        thumbnailUrl: thumbnailUrl || THUMBNAIL_PRESETS[0].url,
        screenshots: screenshots.length > 0 ? screenshots : undefined,
        version: version || 'v1.0.0',
        isPublished,
        features: features.length > 0 ? features : ['Interactive tracking', 'Local persistence'],
        supportedDevices: supportedDevices.length > 0 ? supportedDevices : ['Desktop', 'iPad'],
        purchaseUrl: purchaseUrl || 'https://www.etsy.com',
        externalLinks,
        demoHtml: demoHtml || '<!DOCTYPE html><html><body><h2>WebCraft Demo</h2></body></html>',
        demoInstructions: demoInstructions || undefined,
        tags: tags.length > 0 ? tags : undefined,
        sandboxOptions,
        viewsCount: initialProduct?.viewsCount || 0,
        demoLaunchesCount: initialProduct?.demoLaunchesCount || 0,
        createdAt: initialProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(productPayload);
      onClose();
    } catch (err: any) {
      alert(`Error saving product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {initialProduct ? `Customize Tool: ${initialProduct.title}` : 'Upload & Customize Digital Product'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isPublished ? 'Live in Catalog' : 'Draft Only'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Full customization of all features, links, sandbox settings, and interactive HTML source code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showLivePreview 
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
              title="Test interactive demo in sandbox preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showLivePreview ? 'Hide Preview' : 'Test Preview'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'identity', label: '1. Identity & Pricing', icon: FileText },
            { id: 'features', label: '2. All Features & Devices', icon: Sparkles, badge: features.length },
            { id: 'links', label: '3. All Product Links', icon: LinkIcon },
            { id: 'media', label: '4. Visuals & Media', icon: ImageIcon },
            { id: 'sandbox', label: '5. Demo Sandbox Settings', icon: ShieldCheck },
            { id: 'html', label: '6. HTML Code & Templates', icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`py-3 px-3.5 border-b-2 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content Area (Form or Split View with Preview) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left / Main Editor Form */}
          <form 
            onSubmit={handleSubmit}
            className={`flex-1 overflow-y-auto p-6 space-y-6 ${showLivePreview ? 'w-1/2 border-r border-slate-200 dark:border-slate-800' : 'w-full'}`}
          >

            {/* TAB 1: IDENTITY & PRICING */}
            {activeTab === 'identity' && (
              <div className="space-y-5 animate-in fade-in">
                
                {/* Title and Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Life & Business Operating System Planner"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Promotional Ribbon / Badge
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      {BADGE_PRESETS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category & Version & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      {CATEGORY_PRESETS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Custom">+ Custom Category...</option>
                    </select>
                    {category === 'Custom' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category name..."
                        className="mt-2 w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Version Release
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="v2.4.0"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Catalog Visibility
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                      </label>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isPublished ? 'Published (Live)' : 'Draft (Admin Only)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Listing Price (USD)
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="$29.00"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Original / Strike Price
                    </label>
                    <input
                      type="text"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="$49.00"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 line-through"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Solopreneurs, Agencies, Students"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Short Card Summary (Showcase Cards)
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {shortDescription.length} / 160 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Concise 1-2 sentence hook highlighting the core value proposition..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Comprehensive Product Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full product overview, included sheets, workflows, and benefit breakdown..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Tags / Search Keywords */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Tags & Keywords (Press Enter to add)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag (e.g. notion, tracker)..."
                      className="flex-1 min-w-[140px] p-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: FEATURES & DEVICES */}
            {activeTab === 'features' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Feature List Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Product Capabilities & Features ({features.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customize all bullets shown to prospective buyers and evaluating clients.
                    </p>
                  </div>
                </div>

                {/* Add new feature input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Enter new capability (e.g. Automated Net Margin Calculation)..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feature</span>
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick-Add Recommended Features:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_FEATURES.map((feat) => (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => handleAddSuggestedFeature(feat)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 ${
                          features.includes(feat)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 opacity-60'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                        }`}
                      >
                        {features.includes(feat) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{feat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Features Reorderable List */}
                <div className="space-y-2">
                  {features.map((feat, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <span className="w-6 text-center font-mono text-xs font-bold text-slate-400">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs font-medium text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-purple-500 outline-none px-1"
                      />
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveFeature(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFeature(idx, 'down')}
                          disabled={idx === features.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Delete feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                      No features defined yet. Add features above or select from the recommended presets.
                    </div>
                  )}
                </div>

                {/* Supported Devices / Environments */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Supported Hardware & Runtime Environments
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DEVICE_OPTIONS.map((dev) => {
                      const isSelected = supportedDevices.includes(dev);
                      return (
                        <button
                          key={dev}
                          type="button"
                          onClick={() => toggleDevice(dev)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{dev}</span>
                          {isSelected ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Plus className="w-3.5 h-3.5 opacity-40" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ALL PRODUCT LINKS */}
            {activeTab === 'links' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Product Links & External Integration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure all purchase buttons, documentation manuals, tutorials, and support endpoints.
                  </p>
                </div>

                {/* Primary Etsy Listing URL */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      Primary Etsy Listing URL (Direct Store Purchase) <span className="text-rose-500">*</span>
                    </label>
                    {purchaseUrl && (
                      <a href={purchaseUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1">
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={purchaseUrl}
                    onChange={(e) => setPurchaseUrl(e.target.value)}
                    placeholder="https://www.etsy.com/listing/123456789/..."
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    This link triggers on "Buy Full Version" and when clients reach the session expiration barrier.
                  </p>
                </div>

                {/* Gumroad Checkout URL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gumroad / Direct Checkout URL (Optional)
                    </label>
                    {gumroadUrl && (
                      <a href={gumroadUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Test <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={gumroadUrl}
                    onChange={(e) => setGumroadUrl(e.target.value)}
                    placeholder="https://gumroad.com/l/your-product"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* External Demo Website URL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      External Demo Website URL (Optional)
                    </label>
                    {demoWebsiteUrl && (
                      <a href={demoWebsiteUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Test <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={demoWebsiteUrl}
                    onChange={(e) => setDemoWebsiteUrl(e.target.value)}
                    placeholder="https://demo.webcraftgoods.com/preview"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Documentation / Manual URL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Documentation & Quick-Start Guide URL
                    </label>
                    {docsUrl && (
                      <a href={docsUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Test <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                    placeholder="https://docs.webcraftgoods.com/planner-manual"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Video Tutorial / Walkthrough URL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Video Walkthrough / Tutorial URL (YouTube/Loom/Vimeo)
                    </label>
                    {videoUrl && (
                      <a href={videoUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Test <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Customer Support URL */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Customer Support or Inquiry Contact Link
                    </label>
                    {supportUrl && (
                      <a href={supportUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                        Test <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={supportUrl}
                    onChange={(e) => setSupportUrl(e.target.value)}
                    placeholder="mailto:support@webcraftgoods.com or https://support.webcraftgoods.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

              </div>
            )}

            {/* TAB 4: VISUALS & MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Product Imagery & Visual Assets
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set the primary showcase thumbnail and additional screenshot gallery previews.
                  </p>
                </div>

                {/* Primary Thumbnail */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Primary Showcase Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />

                  {/* Thumbnail Image Live Preview */}
                  <div className="relative aspect-video max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm">
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = THUMBNAIL_PRESETS[0].url;
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/70 text-white backdrop-blur-sm">
                      Live Thumbnail Preview
                    </div>
                  </div>

                  {/* Quick Preset Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Quick Visual Presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {THUMBNAIL_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setThumbnailUrl(preset.url)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-purple-500 text-left transition flex items-center gap-2"
                        >
                          <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Screenshots */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Additional Gallery Screenshots ({screenshots.length})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newScreenshotInput}
                      onChange={(e) => setNewScreenshotInput(e.target.value)}
                      placeholder="Add screenshot URL (https://...)"
                      className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddScreenshot}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold"
                    >
                      Add Image
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {screenshots.map((s, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={s} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: DEMO SANDBOX SETTINGS */}
            {activeTab === 'sandbox' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Demo Sandbox & Security Isolation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control how the interactive application executes inside the client's evaluation sandbox.
                  </p>
                </div>

                {/* Suggested Demo Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Suggested Evaluation Duration
                    </label>
                    <select
                      value={suggestedDuration}
                      onChange={(e) => setSuggestedDuration(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    >
                      <option value={10}>10 Minutes (Quick Walkthrough)</option>
                      <option value={15}>15 Minutes (Standard Recommended)</option>
                      <option value={30}>30 Minutes (Deep Evaluation)</option>
                      <option value={60}>60 Minutes (Extended Audit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reset Button in Demo Header
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableResetButton}
                          onChange={(e) => setEnableResetButton(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                      </label>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {enableResetButton ? 'Enabled (Allow Reset)' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LocalStorage Isolation Toggle */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Enforce Client LocalStorage Isolation
                      </h4>
                      <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                        Prefixes all `localStorage` calls with `wc_demo_[clientId]_[productId]_` so testing data remains completely private.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowStorageIsolation}
                        onChange={(e) => setAllowStorageIsolation(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Custom Demo Header Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Demo Header Note / Client Welcome Tag
                  </label>
                  <input
                    type="text"
                    value={customHeaderNote}
                    onChange={(e) => setCustomHeaderNote(e.target.value)}
                    placeholder="e.g. Sandboxed Client Origin • Isolated LocalStorage"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Guided Demo Instructions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Client Demo Instructions & Tour Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={demoInstructions}
                    onChange={(e) => setDemoInstructions(e.target.value)}
                    placeholder="Instructions for testing: e.g. 'Click into sprint backlog to drag cards, or click the KPI toggle to see live margin updates.'"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

              </div>
            )}

            {/* TAB 6: HTML CODE & TEMPLATES */}
            {activeTab === 'html' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Interactive HTML Application Payload
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Load starter templates or upload a `.html` file from your computer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Upload .html file */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".html,.htm"
                      onChange={handleHtmlFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload .html File</span>
                    </button>

                    {/* Starter templates dropdown */}
                    <select
                      onChange={(e) => e.target.value && handleApplyTemplate(e.target.value)}
                      defaultValue=""
                      className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300"
                    >
                      <option value="" disabled>Load Starter Template...</option>
                      {STARTER_TEMPLATES.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Source Code Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      HTML5 / CSS / JavaScript • {demoHtml.length} characters
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(demoHtml);
                        setStatusMessage('HTML source copied to clipboard.');
                        setTimeout(() => setStatusMessage(''), 2500);
                      }}
                      className="text-[11px] font-semibold text-purple-600 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy Code
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={demoHtml}
                    onChange={(e) => setDemoHtml(e.target.value)}
                    className="w-full p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    spellCheck={false}
                  />
                </div>

              </div>
            )}

          </form>

          {/* Right Live Preview Split Panel (if open) */}
          {showLivePreview && (
            <div className="w-1/2 flex flex-col bg-slate-950 border-l border-slate-800">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  Live Sandboxed Sandbox Preview
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {title || 'Untitled Tool'}
                </span>
              </div>
              <div className="flex-1 w-full bg-white relative">
                <iframe
                  title="Sandbox Live Preview"
                  srcDoc={demoHtml}
                  sandbox="allow-scripts allow-forms allow-modals"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {initialProduct ? 'Editing existing tool catalog record' : 'Ready to publish new tool to Cloud Firestore'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Saving to Firestore...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialProduct ? 'Save Tool Customizations' : 'Publish & Save to Catalog'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
