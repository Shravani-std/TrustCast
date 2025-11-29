import React, { useState } from 'react';
import { ArrowLeft, Shield, Mail, MapPin, Phone, Send } from 'lucide-react';

const ContactPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#120202]" />
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-red-600/30 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-red-900/25 blur-[140px]" />
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

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">Get in Touch</h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Have questions about TrustCast? Want to schedule a demo? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-gray-900/60 bg-black/50 p-4">
                <div className="rounded-xl bg-red-600/10 p-3 border border-red-600/40">
                  <Mail className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <p className="text-sm text-gray-300">contact@trustcast.ai</p>
                  <p className="text-sm text-gray-300">support@trustcast.ai</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-900/60 bg-black/50 p-4">
                <div className="rounded-xl bg-red-600/10 p-3 border border-red-600/40">
                  <Phone className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Phone</h3>
                  <p className="text-sm text-gray-300">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-300">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-900/60 bg-black/50 p-4">
                <div className="rounded-xl bg-red-600/10 p-3 border border-red-600/40">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Office</h3>
                  <p className="text-sm text-gray-300">123 Security Boulevard</p>
                  <p className="text-sm text-gray-300">San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-900/60 bg-black/50 p-8 shadow-[0_40px_120px_rgba(220,38,38,0.18)] backdrop-blur">
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-300 mb-1 block">Name</span>
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
                <span className="text-sm font-semibold text-gray-300 mb-1 block">Subject</span>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="How can we help?"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-300 mb-1 block">Message</span>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your needs..."
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(220,38,38,0.45)] hover:bg-red-500 transition-all"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

