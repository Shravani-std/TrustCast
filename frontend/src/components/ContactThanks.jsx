import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactThanks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-2xl w-full text-center rounded-2xl border border-gray-900/60 bg-black/70 p-12">
        <CheckCircle className="mx-auto text-green-400 mb-6" size={48} />
        <h1 className="text-3xl font-semibold mb-4">Thanks — we received your message</h1>
        <p className="text-gray-300 mb-8">
          Our team will review your message and get back to you shortly.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Back to Home
          </button>

          <button
            onClick={() => navigate('/contact')}
            className="rounded-xl border border-gray-800 px-4 py-2 text-sm font-semibold text-white hover:border-red-500"
          >
            Send another message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactThanks;
