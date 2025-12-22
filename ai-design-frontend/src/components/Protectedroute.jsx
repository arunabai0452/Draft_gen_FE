import React, { useState } from 'react';

/**
 * ProtectedRoute Component
 * 
 * Optional authentication wrapper for admin routes
 * 
 * USAGE:
 * In App.js:
 * import ProtectedRoute from './components/ProtectedRoute';
 * 
 * <Route 
 *   path="/admin" 
 *   element={
 *     <ProtectedRoute password="your-password">
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   } 
 * />
 */

const ProtectedRoute = ({ children, password = 'admin123' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (inputPassword === password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setInputPassword('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00303C',
          fontFamily: "'DIN', 'DIN Bold', 'DIN Alternate', Arial, sans-serif"
        }}
      >
        <div
          style={{
            background: '#004454',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img
              src="/MF_SquareLogo_White.png"
              alt="Logo"
              style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: '1rem' }}
            />
            <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              Admin Access
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              Enter your password to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {/* Password Input */}
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter admin password"
            autoFocus
            style={{
              width: '100%',
              padding: '0.875rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              background: '#00303C',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#06b6d4';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)';
            }}
          />

          {/* Login Button */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(to right, #06b6d4, #14b8a6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, #0891b2, #0d9488)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(to right, #06b6d4, #14b8a6)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login to Admin
          </button>

          {/* Footer */}
          <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
            Protected access • Brand Visualization Tool
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;