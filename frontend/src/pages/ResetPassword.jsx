import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('New password is required');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password updated. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
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
          <div className="badge mb-4">Set new password</div>
          <h1 className="font-display text-3xl text-ink mb-2">Reset password</h1>
          <p className="text-ink-soft mb-6">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm text-ink-soft mb-2">
                <Lock className="w-4 h-4 inline-block mr-1" />
                New password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <p className="mt-2 text-xs text-ink-soft">Minimum 8 characters.</p>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>

          <p className="text-center text-ink-soft text-sm mt-6">
            Back to{' '}
            <Link className="text-amber-500 font-semibold" to="/login">
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
