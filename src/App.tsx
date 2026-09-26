import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { PublicHome } from './components/PublicHome';
import { ClientPortal } from './components/ClientPortal';
import { AdminPanel } from './components/AdminPanel';
import { HtmlDemoViewer } from './components/HtmlDemoViewer';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { LoginModal } from './components/LoginModal';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { RequestTimeModal } from './components/RequestTimeModal';
import { productService } from './services/productService';
import { Product } from './types';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';

function MainApp() {
  const { 
    currentUser, 
    clientProfile, 
    currentSession, 
    remainingSeconds, 
    isAdmin, 
    isClient, 
    activateDemoSession,
    setIsDemoOpen,
    pauseActiveSession,
    resumeActiveUseSession
  } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'portal' | 'admin' | 'product_details'>('home');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  
  // Active demo viewer state
  const [activeDemoProduct, setActiveDemoProduct] = useState<Product | null>(null);
  
  // Product details modal
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  
  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'admin' | 'client'>('client');
  const [loginMessage, setLoginMessage] = useState('');
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetProduct, setRequestTargetProduct] = useState<Product | null>(null);

  const handleCloseDemo = async () => {
    setActiveDemoProduct(null);
    setIsDemoOpen(false);
    if (isClient && clientProfile && (clientProfile.timerMode === 'active_use' || currentSession?.timerMode === 'active_use')) {
      await pauseActiveSession();
    }
  };

  // Subscribe to real-time products & seed catalog if empty
  useEffect(() => {
    productService.seedCatalogIfEmpty(isAdmin);
    const unsub = productService.subscribeProducts((prods) => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    });
    return () => unsub();
  }, [isAdmin]);

  // Monitor live session expiry while demo viewer is active
  useEffect(() => {
    if (activeDemoProduct && isClient) {
      if (currentSession?.status === 'expired' || currentSession?.status === 'revoked' || (currentSession?.status === 'active' && remainingSeconds <= 0)) {
        handleCloseDemo();
        setIsExpiredModalOpen(true);
      }
    }
  }, [remainingSeconds, currentSession, activeDemoProduct, isClient]);

  const handleLaunchDemo = async (prod: Product) => {
    // Check authentication
    if (!currentUser) {
      setLoginMessage('Please log in with your authorized client credentials to access this interactive demo.');
      setIsLoginModalOpen(true);
      return;
    }

    // Check client permission
    if (isClient) {
      if (clientProfile?.status !== 'active') {
        alert('Your client account is currently suspended. Please contact the administrator.');
        return;
      }

      if (currentSession?.status === 'expired' || (currentSession?.status === 'active' && remainingSeconds <= 0)) {
        setIsExpiredModalOpen(true);
        return;
      }

      const hasPermission = clientProfile.allowedProductIds.includes('*') || clientProfile.allowedProductIds.includes(prod.id);
      if (!hasPermission) {
        setRequestTargetProduct(prod);
        setIsRequestModalOpen(true);
        return;
      }

      // Activate or resume session
      if (!currentSession || currentSession.status === 'idle') {
        await activateDemoSession(prod.id, prod.title);
      } else if (currentSession.status === 'paused' || clientProfile.timerMode === 'active_use' || currentSession?.timerMode === 'active_use') {
        // In active_use mode or paused session: launching a demo actively resumes tracking
        await resumeActiveUseSession();
      }
    }

    // Record metrics
    productService.incrementLaunches(prod.id);
    setIsDemoOpen(true);
    setActiveDemoProduct(prod);
  };

  const handleViewDetails = (prod: Product) => {
    productService.incrementViews(prod.id);
    setInspectingProduct(prod);
  };

  const handleRequireLogin = (msg?: string, tab: 'admin' | 'client' = 'client') => {
    setLoginMessage(msg || (tab === 'admin' ? 'Sign in with your Master Admin credentials to access the management studio.' : 'Please log in with your authorized client credentials to access this interactive demo.'));
    setLoginInitialTab(tab);
    setIsLoginModalOpen(true);
  };

  const handleOpenRequestTime = (prod?: Product) => {
    setRequestTargetProduct(prod || null);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors">
      
      {/* Universal Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLogin={(tab) => handleRequireLogin(undefined, tab || 'client')}
        onOpenRequestTime={() => handleOpenRequestTime()}
      />

      {/* Main View Switcher */}
      <div className="flex-1">
        {currentView === 'home' && (
          <PublicHome
            products={products}
            onLaunchDemo={handleLaunchDemo}
            onViewDetails={handleViewDetails}
            onRequestAccess={(p) => handleOpenRequestTime(p)}
            onRequireLogin={() => handleRequireLogin()}
            onOpenClientPortal={() => setCurrentView('portal')}
            isAuthenticated={Boolean(currentUser)}
          />
        )}

        {currentView === 'portal' && (
          <ClientPortal
            products={products}
            onLaunchDemo={handleLaunchDemo}
            onViewDetails={handleViewDetails}
            onRequestTime={(p) => handleOpenRequestTime(p)}
            onRequireLogin={() => handleRequireLogin()}
          />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminPanel
              products={products}
              onLaunchDemo={handleLaunchDemo}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-xl font-bold">
                🔒
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Admin Privileges Required</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                The Master Administration Studio is restricted to authenticated administrator accounts. Please sign in with your administrator credentials to proceed.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentView('home')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Return Home
                </button>
                <button
                  onClick={() => handleRequireLogin(undefined, 'admin')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-sm shadow-purple-500/25 cursor-pointer"
                >
                  Sign In as Admin
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Full-Width Interactive HTML Demo Viewer */}
      {activeDemoProduct && (
        <HtmlDemoViewer
          product={activeDemoProduct}
          onClose={handleCloseDemo}
          onOpenReportIssue={() => handleOpenRequestTime(activeDemoProduct)}
          onSessionExpired={() => {
            handleCloseDemo();
            setIsExpiredModalOpen(true);
          }}
        />
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={inspectingProduct}
        isOpen={Boolean(inspectingProduct)}
        onClose={() => setInspectingProduct(null)}
        onLaunchDemo={handleLaunchDemo}
        onRequireLogin={() => handleRequireLogin()}
        onRequestAccess={(p) => handleOpenRequestTime(p)}
      />

      {/* Client & Admin Login Dialog */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginMessage('');
        }}
        initialMessage={loginMessage}
        initialTab={loginInitialTab}
        onAdminLoginSuccess={() => setCurrentView('admin')}
      />

      {/* Session Expired Alert Modal */}
      <SessionExpiredModal
        isOpen={isExpiredModalOpen}
        onClose={() => setIsExpiredModalOpen(false)}
        onRequestTime={() => handleOpenRequestTime()}
        productTitle={activeDemoProduct?.title}
        purchaseUrl={activeDemoProduct?.purchaseUrl}
      />

      {/* Request Time & Access Modal */}
      <RequestTimeModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setRequestTargetProduct(null);
        }}
        targetProduct={requestTargetProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider initialTheme="premium-light">
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
