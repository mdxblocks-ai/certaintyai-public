import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RegionProvider } from './context/RegionContext'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Survey from './pages/Survey'
import Report from './pages/Report'
import Dashboard from './pages/Dashboard'
import Foundry from './pages/Foundry'
import Architecture from './pages/Architecture'

export default function App() {
  return (
    <BrowserRouter>
      <RegionProvider>
        <AuthProvider>
          <Navbar />
          <main>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/foundry" element={<Foundry />} />
                <Route path="/architecture" element={<Architecture />} />
                {/* Survey + Report are public (anonymous flow). */}
                <Route path="/survey" element={<Survey />} />
                <Route path="/report/:token" element={<Report />} />
                {/* Profile and Dashboard are auth-only. */}
                <Route
                  path="/profile"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent-builder"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard?tab=agent-builder" replace />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </AuthProvider>
      </RegionProvider>
    </BrowserRouter>
  )
}
