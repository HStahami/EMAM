import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { inputStyle } from '../../components/common/styles';

export function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const userData = await login(username, password);
      if (userData.role !== 'admin') {
        logout();
        setError(`Access Denied: This account has '${userData.role}' privileges. Only administrators are authorized to access the Admin Dashboard.`);
        return;
      }
      if (onLogin) onLogin();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center', backgroundColor: 'rgba(44, 5, 13, 0.65)', border: '1px solid rgba(241, 163, 42, 0.18)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
          <img src="/emam_logo.png" alt="Emam Logo" style={{ height: 54, width: 54, objectFit: 'contain' }} />
        </Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>Admin Portal Login</h1>
        <p style={{ color: 'rgba(241,163,42,0.55)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Institutional management, student onboarding & platform controls.</p>
        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
          <div>
            <label htmlFor="admin_username" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#f0ceb3' }}>
              Username or Email
            </label>
            <input
              id="admin_username"
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="admin_password" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#f0ceb3' }}>
              Password
            </label>
            <input
              id="admin_password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem' }}><Link to="/" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>← Return to Main Website</Link></div>
      </div>
    </div>
  );
}
