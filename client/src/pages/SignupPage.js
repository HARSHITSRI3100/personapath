import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Your Name',  key: 'name',     type: 'text',     placeholder: 'Alex Morgan',        autoComplete: 'name' },
    { label: 'Email',      key: 'email',    type: 'email',    placeholder: 'you@example.com',    autoComplete: 'email' },
    { label: 'Password',   key: 'password', type: 'password', placeholder: 'Min. 6 characters',  autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 glow-purple pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-8 transition-colors">
          ← Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <span className="text-2xl">🪞</span>
          </div>
          <h1 className="font-display text-3xl text-white">Create your mirror</h1>
          <p className="text-zinc-400 mt-2 text-sm">Begin your self-discovery journey — free forever</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-zinc-300 mb-2">{f.label}</label>
                <input
                  type={f.type}
                  required
                  autoComplete={f.autoComplete}
                  className="input"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
