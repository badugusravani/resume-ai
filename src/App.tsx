import React from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreditProvider } from './contexts/CreditContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ResumeMaker from './pages/ResumeMaker';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PurchaseCredits from './pages/PurchaseCredits';
import AdminDashboard from './pages/AdminDashboard';
// @ts-ignore
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Determine which router to use
// Use HashRouter for GitHub Pages, and BrowserRouter for everything else
const isGitHubPages = window.location.hostname.includes('github.io');
const Router = isGitHubPages ? HashRouter : BrowserRouter;

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Admin Route wrapper component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user && user.isAdmin ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <CreditProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-gray-50">
                <ErrorBoundary>
                  <Navbar />
                </ErrorBoundary>
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/resume-maker" 
                      element={
                        <ProtectedRoute>
                          <ResumeMaker />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/purchase-credits" 
                      element={
                        <ProtectedRoute>
                          <PurchaseCredits />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } 
                    />
                    <Route path="/about" element={
                      <ErrorBoundary>
                        <About />
                      </ErrorBoundary>
                    } />
                  </Routes>
                </main>
                <ErrorBoundary>
                  <Footer />
                </ErrorBoundary>
                {/* Use only one toast container to avoid conflicts */}
                <Toaster position="top-right" />
                <ToastContainer 
                  position="top-right" 
                  autoClose={5000}
                  hideProgressBar={false}
                  closeOnClick
                  pauseOnHover
                />
              </div>
            </Router>
          </CreditProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;