import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Layout components
import Header from './components/layout/Header'

// Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import LoginPage from './pages/LoginPage'

// Hooks
import { useAuthStore } from './store/authStore'

function App() {
  const location = useLocation()
  const { user } = useAuthStore()

  // Check if current page should have minimal layout (auth pages)
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - hidden on auth pages */}
      {!isAuthPage && <Header />}
      
      {/* Main content area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Catch-all route */}
              <Route path="*" element={
                <div className="container-custom section-padding text-center">
                  <h1 className="heading-2 mb-4">Page Not Found</h1>
                  <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      
    </div>
  )
}

export default App
