import React, { useState } from 'react';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from "../lib/apiClient";

const LoginPage = ({ onNavigate, onLogin }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    api.post("/auth/login", {
      email: formData.email,
      password: formData.password,
    })
      .then((res) => {
        onLogin(res.data);
      })
      .catch((err) => {
        const message = err?.response?.data?.detail || "Login failed";
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden px-4 py-12 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#120202]" />
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-red-700/30 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-red-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="grid lg:grid-cols-2 gap-8 rounded-3xl border border-red-900/40 bg-black/70 p-10 shadow-[0_40px_120px_rgba(220,38,38,0.25)] backdrop-blur-xl">
          {/* Left Side - Branding */}
          <div className="rounded-2xl bg-gradient-to-br from-red-800 via-red-900 to-black p-8 text-white flex flex-col justify-center border border-red-500/30 shadow-inner shadow-red-900/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">TrustCast</p>
                <p className="text-lg font-semibold">Network Security Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-semibold mb-4">Secure access for trust analysts</h2>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Multi-factor authentication, device attestation, and risk-aware login flows keep adversaries out of your network.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Lock className="h-4 w-4" />
              <span>Enterprise-grade security</span>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-900/60 bg-black/40 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Sign In</h3>
              <p className="text-sm text-gray-400">Enter your credentials to access the dashboard</p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="analyst@trustcast.ai"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </label>



            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberDevice}
                  onChange={(e) => setFormData({ ...formData, rememberDevice: e.target.checked })}
                  className="rounded border-gray-600 bg-black/70 text-red-600 focus:ring-red-500"
                />
                Remember this device
              </label>
              <button
                type="button"
                className="font-semibold text-red-500 hover:text-red-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(220,38,38,0.45)] hover:bg-red-500 transition-all"
            >
              {loading ? "Signing in..." : "Sign in securely"}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  if (typeof onNavigate === "function") {
                    onNavigate("register");
                    return;
                  }
                  navigate("/register");
                }}
                className="font-semibold text-red-500 hover:text-red-400 transition-colors"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

