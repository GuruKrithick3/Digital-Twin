import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Snowflake, User, Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B132B]">
      <div className="w-full max-w-md rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5 flex items-center justify-center shadow-[0_0_25px_-4px_rgba(0,245,212,0.45)]">
            <div className="w-full h-full bg-black/60 rounded-[14px] flex items-center justify-center">
              <Snowflake className="w-7 h-7 text-cyan-300" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white tracking-tight font-heading">Access Control</h1>
          <p className="text-sm text-slate-400 text-center mt-1">Antarctic Digital Twin Remote Management Platform</p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-heading tracking-wide">SECURE · ROLE-BASED ACCESS</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 font-semibold mb-1.5 block tracking-wide text-xs">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm
                           focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold mb-1.5 block tracking-wide text-xs">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm
                           focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#3A86FF] to-[#00F5D4] text-[#0B0B0F] font-bold text-sm
                       font-heading tracking-wide hover:shadow-[0_0_25px_-5px_rgba(0,245,212,0.5)]
                       disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
