'use client';

import React, { useState } from 'react';

interface ModalCTAProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCTA({ isOpen, onClose }: ModalCTAProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl bg-[#181818] text-[#f8f4ee] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#d4a373] mb-2 font-mono">
            Get In Touch
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light">
            Start a Conversation
          </h2>
          <p className="text-sm text-neutral-400 mt-2 font-light">
            Tell us about your residential or investment aspirations. Our team will get back to you shortly.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-light">Thank You</h3>
            <p className="text-sm text-neutral-400 mt-1">We have received your request.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                Your Name
              </label>
              <input
                required
                type="text"
                placeholder="Lord / Lady / Architect"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4a373] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                  Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="contact@domain.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4a373] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+971 -- --- ----"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4a373] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-medium">
                Project or Inquiry
              </label>
              <textarea
                rows={3}
                placeholder="Details about your interest, site, or design specifications..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4a373] transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-lg bg-[#f8f4ee] text-[#121212] font-medium text-xs uppercase tracking-widest hover:bg-[#d4a373] hover:text-white transition-all duration-300 mt-2"
            >
              Submit Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
