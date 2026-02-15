import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthContext from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <div className="badge mb-4">Start sharing</div>
          <h1 className="font-display text-3xl text-ink mb-2">Create account</h1>
          <p className="text-ink-soft mb-6">
            Make an account to upload and view your secure links.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-ink-soft mb-2">
                <User className="w-4 h-4 inline-block mr-1" />
                Name
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

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
                placeholder="Create a password"
              />
              <p className="mt-2 text-xs text-ink-soft">Minimum 8 characters.</p>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-ink-soft text-sm mt-6">
            Already have an account?{' '}
            <Link className="text-amber-500 font-semibold" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
