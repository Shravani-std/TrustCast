import React, { useState } from 'react';
import { Shield, ArrowLeft, Check } from 'lucide-react';

const RegisterPage = ({ onNavigate, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Simulate registration
    if (formData.email && formData.password) {
      onRegister();
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden px-4 py-12 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#120202]" />
      <div className="absolute inset-0">
        <div className="absolute -top-24 left-10 h-96 w-96 rounded-full bg-red-600/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-red-900/30 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="grid lg:grid-cols-2 gap-8 rounded-3xl border border-red-900/40 bg-black/70 p-10 shadow-[0_40px_120px_rgba(220,38,38,0.25)] backdrop-blur-xl">
          {/* Left Side - Branding */}
          <div className="rounded-2xl bg-gradient-to-br from-red-900 via-black to-black p-8 text-white flex flex-col justify-center border border-red-500/30 shadow-inner shadow-red-900/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">TrustCast</p>
                <p className="text-lg font-semibold">Join the Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-semibold mb-4">Start securing your IoT network today</h2>
            <p className="text-sm text-white/90 leading-relaxed mb-6">
              Get access to real-time trust scoring, anomaly detection, and ML-powered security insights for your IoT infrastructure.
            </p>
            <div className="space-y-3">
              {[
                'Real-time device monitoring',
                'ML-powered trust scoring',
                'Enterprise security features',
                '24/7 anomaly detection'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white/90">
                  <Check className="h-4 w-4" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-900/60 bg-black/40 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Create Account</h3>
              <p className="text-sm text-gray-400">Sign up to get started with TrustCast</p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Full Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="john@company.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Organization</span>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="Acme Corp"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Password</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white shadow-inner focus:outline-none transition-colors ${
                  errors.password ? 'border-red-500 bg-black/60' : 'border-gray-800 bg-black/60 focus:border-red-500'
                }`}
                placeholder="••••••••"
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-300 mb-1 block">Confirm Password</span>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white shadow-inner focus:outline-none transition-colors ${
                  errors.confirmPassword ? 'border-red-500 bg-black/60' : 'border-gray-800 bg-black/60 focus:border-red-500'
                }`}
                placeholder="••••••••"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </label>

            <label className="flex items-start gap-2 text-xs cursor-pointer text-gray-400">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => {
                  setFormData({ ...formData, agreeToTerms: e.target.checked });
                  setErrors({ ...errors, agreeToTerms: '' });
                }}
                className="mt-0.5 rounded border-gray-700 bg-black/70 text-red-600 focus:ring-red-500"
              />
              <span>
                I agree to the{' '}
                <button type="button" className="font-semibold text-red-500 hover:text-red-400">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="font-semibold text-red-500 hover:text-red-400">
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-400">{errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(220,38,38,0.45)] hover:bg-red-500 transition-all"
            >
              Create Account
            </button>

            <div className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-red-500 hover:text-red-400 transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

