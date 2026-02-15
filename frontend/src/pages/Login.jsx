import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl float-slow pulse-soft"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-10 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl float-slower pulse-soft"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
        <div className="card w-full animate-slide-up">
          <div className="badge mb-4">Welcome back</div>
          <h1 className="font-display text-3xl text-ink mb-2">Login</h1>
          <p className="text-ink-soft mb-6">
            Sign in to access your private links.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-ink-soft mb-2">
                <Mail className="w-4 h-4 inline-block mr-1" />
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-ink-soft mb-2">
                <Lock className="w-4 h-4 inline-block mr-1" />
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-ink-soft text-sm mt-6">
            New here?{' '}
            <Link className="text-amber-500 font-semibold" to="/register">
              Create an account
            </Link>
          </p>
          <p className="text-center text-ink-soft text-sm mt-2">
            <Link className="text-amber-500 font-semibold" to="/forgot-password">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
