/**
 * Admin Authentication Router
 * Handles admin login verification against admins collection in Firestore
 */

import React, { useState } from 'react';
import { AlertCircle, Lock, Mail, Loader, Shield } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/AdminAuth.css';

const AdminAuthRouter = ({ onAdminLogin, onNavigateBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Query admins collection to verify credentials
      const q = query(
        collection(db, 'admins'),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid admin credentials');
        setLoading(false);
        return;
      }

      // Get admin document
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      // In a production app, you'd use proper password hashing (bcrypt)
      // For demo purposes, we're checking a hashed password in Firestore
      // Never store plain text passwords!
      if (adminData.password !== password) { // This is a demo - use proper hashing in production!
        setError('Invalid admin credentials');
        setLoading(false);
        return;
      }

      // Successful login
      onAdminLogin({
        uid: adminDoc.id,
        email: adminData.email,
        name: adminData.name || 'Administrator',
        role: 'admin'
      });
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        {/* Logo/Header */}
        <div className="auth-header">
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #1b5e20 0%, #2d7a3a 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 700,
            color: '#333'
          }}>
            Admin Portal
          </h1>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: '#999'
          }}>
            Enter your admin credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">
              <Mail size={18} />
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="admin@healthgene.com"
              className="form-input"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                className="form-input"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner-icon" />
                Authenticating...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="demo-info">
          <p style={{ margin: '0', fontSize: '12px', color: '#999', fontWeight: 500 }}>
            Demo Credentials (Development Only)
          </p>
          <code style={{
            display: 'block',
            background: '#f5f7fa',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#333',
            marginTop: '6px',
            fontFamily: 'monospace'
          }}>
            Email: admin@healthgene.com
            <br />
            Password: (Set in Firestore admins collection)
          </code>
        </div>

        {/* Back Button */}
        <button
          type="button"
          className="back-button"
          onClick={onNavigateBack}
          disabled={loading}
        >
          ← Back to Login
        </button>
      </div>

      <style jsx>{`
        .admin-auth-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-auth-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          color: #721c24;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .auth-form {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: grid;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #1b5e20;
          box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.1);
        }

        .form-input:disabled {
          background: #f5f7fa;
          color: #999;
          cursor: not-allowed;
        }

        .password-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-group .form-input {
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: #1b5e20;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .auth-button {
          padding: 12px 16px;
          background: linear-gradient(135deg, #1b5e20 0%, #2d7a3a 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .demo-info {
          background: #f5f7fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .back-button {
          width: 100%;
          padding: 10px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          color: #666;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .back-button:hover:not(:disabled) {
          border-color: #1b5e20;
          color: #1b5e20;
          background: rgba(27, 94, 32, 0.02);
        }

        .back-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .admin-auth-card {
            padding: 20px;
          }

          .auth-header h1 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAuthRouter;
