import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 glow-indigo pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-8 transition-colors">
          ← Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <span className="text-2xl">🪞</span>
          </div>
          <h1 className="font-display text-3xl text-white">Welcome back</h1>
          <p className="text-zinc-400 mt-2 text-sm">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                type="email" required autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                type="password" required autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            No account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
            <button
              onClick={() => setForm({ email: 'demo@personapath.com', password: 'demo1234' })}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Use demo account → demo@personapath.com / demo1234
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
