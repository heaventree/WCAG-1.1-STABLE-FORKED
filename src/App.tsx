import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { SubscriptionDashboard } from './pages/SubscriptionDashboard';
import { PaymentPage } from './pages/PaymentPage';
import { AuthPage } from './pages/AuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminPaymentGateways } from './pages/admin/AdminPaymentGateways';
import { AdminCMS } from './pages/admin/AdminCMS';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { ThemeProvider } from './providers/ThemeProvider';
import { WCAGCheckerPage } from './pages/WCAGCheckerPage';
import { WCAGRequirementsTable } from './pages/WCAGRequirementsTable';
import { WCAGColorPalette } from './components/WCAGColorPalette';
import { BlogPage } from './pages/BlogPage';
import { ArticlePage } from './pages/ArticlePage';
import { BackToTop } from './components/BackToTop';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import './styles/accessibility.css';
import './styles/main.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" />
        <div className="min-h-screen bg-white dark:bg-gray-900">
          {/* Skip to main content link */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <LandingPage />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/pricing"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <PricingPage />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/checker"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <WCAGCheckerPage />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/tools/colors"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <WCAGColorPalette />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/tools/requirements"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <WCAGRequirementsTable />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/blog"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <BlogPage />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <>
                  <Navigation />
                  <main id="main-content">
                    <ArticlePage />
                  </main>
                  <Footer />
                  <BackToTop />
                </>
              }
            />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Protected Client Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <main id="main-content">
                    <SubscriptionDashboard />
                  </main>
                  <Footer />
                  <BackToTop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:planId"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <main id="main-content">
                    <PaymentPage />
                  </main>
                  <Footer />
                  <BackToTop />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute isAdmin>
                  <AdminLayout />
                  <BackToTop />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="payment-gateways" element={<AdminPaymentGateways />} />
              <Route path="cms/*" element={<AdminCMS />} />
            </Route>
          </Routes>
          <AccessibilityToolbar />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;