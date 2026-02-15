import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }
    setLoading(true);
    try {
      const response = await requestPasswordReset(email);
      const token = response?.data?.resetToken || '';
      setDevToken(token);
      toast.success('If the email exists, a reset link has been generated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
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
          <div className="badge mb-4">Reset access</div>
          <h1 className="font-display text-3xl text-ink mb-2">Forgot password</h1>
          <p className="text-ink-soft mb-6">
            Enter your account email to generate a reset token.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
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

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset token'}
            </button>
          </form>

          {devToken ? (
            <div className="notice mt-6 text-sm">
              Dev reset token: <span className="font-mono">{devToken}</span>
            </div>
          ) : null}

          <p className="text-center text-ink-soft text-sm mt-6">
            Remembered?{' '}
            <Link className="text-amber-500 font-semibold" to="/login">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
