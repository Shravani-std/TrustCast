import React from 'react';
import { ArrowLeft, Shield, Activity, Database, Lock, Zap } from 'lucide-react';

const AboutPage = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-[#0b0202]" />
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-10 h-80 w-80 rounded-full bg-red-700/25 blur-[120px]" />
        <div className="absolute bottom-10 left-4 h-72 w-72 rounded-full bg-red-500/20 blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/95 to-transparent">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-600/20 p-2 text-red-300 border border-red-600/40">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-white">TrustCast</span>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="rounded-xl border border-red-900/40 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-red-600/20 transition-colors"
        >
          Back to Home
        </button>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-8 py-16">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-5xl font-black text-white mb-4">About TrustCast</h1>
        <p className="text-lg text-gray-300 mb-12 leading-relaxed max-w-3xl">
          TrustCast is an enterprise-grade IoT security platform that leverages advanced machine learning to calculate real-time trust scores for connected devices. Our mission is to help organizations secure their IoT infrastructure through intelligent monitoring, anomaly detection, and automated threat response.
        </p>

        <div className="space-y-10 mb-16">
          <div className="rounded-3xl border border-red-900/30 bg-black/50 p-8 shadow-[0_40px_120px_rgba(220,38,38,0.12)] backdrop-blur-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Technology</h2>
            <p className="text-gray-300 leading-relaxed">
              TrustCast uses state-of-the-art machine learning models, including TimeGAN for synthetic data generation, SMOTE for class balancing, and deep neural networks for behavioral analysis. Our platform continuously learns from device interactions, network patterns, and historical data to provide accurate trust assessments.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Activity, title: 'Real-Time Monitoring', desc: 'Continuous trust scoring and anomaly detection across your entire IoT network.' },
                { icon: Database, title: 'ML-Powered Insights', desc: 'Advanced machine learning models trained on behavioral patterns.' },
                { icon: Lock, title: 'Enterprise Security', desc: 'Multi-factor authentication, audit logs, and role-based access control.' },
                { icon: Zap, title: 'Auto Quarantine', desc: 'Automatically isolate devices with trust scores below threshold.' }
              ].map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-900/60 bg-black/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
                  <feature.icon className="h-8 w-8 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-900/60 bg-black/50 p-8 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white mb-4">Use Cases</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Industrial IoT security monitoring for manufacturing facilities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Smart city infrastructure protection and anomaly detection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Healthcare IoT device trust scoring and compliance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span>Enterprise network security for connected office devices</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

