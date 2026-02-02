import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // DEMO MODE: For MVP, create a mock token
      // In production, integrate with Supabase or your auth backend
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create proper JWT token format: header.payload.signature
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const payload = btoa(JSON.stringify({
        sub: 'demo-user-' + Date.now(),
        email: email,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now in seconds
        aud: 'authenticated',
        iat: Math.floor(Date.now() / 1000)
      })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const signature = btoa('demo-signature').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      
      const demoToken = `${header}.${payload}.${signature}`;

      // Store token
      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('user_email', email);

      // Redirect to original page or checkout if they have cart items
      const from = location.state?.from;
      if (from && (from === '/cart' || from === '/checkout')) {
        navigate('/checkout');
      } else if (from) {
        navigate(from);
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <h1 className="heading-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="body-base text-secondary">
              {isLogin
                ? 'Sign in to access your account'
                : 'Join us to experience luxury timepieces'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="login-footer">
            <p className="body-small text-secondary">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="link-button"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="divider">
            <span className="divider-text body-small text-muted">OR</span>
          </div>

          <div className="social-login">
            <button className="btn btn-secondary btn-full">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.128 20 14.991 20 10c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
