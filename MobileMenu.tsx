'use client';

import React from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCTA: () => void;
}

export default function MobileMenu({ isOpen, onClose, onOpenCTA }: MobileMenuProps) {
  if (!isOpen) return null;

  const links = [
    { title: 'Home', href: '/' },
    { title: 'About us', href: '/#about' },
    { title: 'Architecture 3D', href: '/#architecture' },
    { title: 'Projects', href: '/#projects' },
    { title: 'Philosophy', href: '/#services' },
    { title: 'Contact', href: '/#contact' },
  ];

  return (
    <div
      className="menu-enter fixed inset-0 z-50 flex flex-col justify-between bg-[#171816] px-8 py-8 text-[#f8f4ee] md:px-16 md:py-12"
      role="dialog"
      aria-modal="true"
      aria-label="Main navigation"
    >
      {/* Top row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="text-xs uppercase tracking-widest font-mono text-neutral-400">
          Navigation
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main navigation links */}
      <div className="my-auto flex flex-col gap-3 py-10 md:gap-4">
        {links.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            onClick={onClose}
            className="group flex items-center justify-between border-b border-white/10 py-3 font-serif text-[clamp(2rem,6vw,4.5rem)] font-light leading-none transition-colors duration-300 hover:text-[#d4a373] md:py-4"
          >
            <span>{item.title}</span>
            <span className="font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
              0{idx + 1}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom section */}
      <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-neutral-400">
        <div>&copy; {new Date().getFullYear()} Lenval Group. All rights reserved.</div>
        <button
          onClick={() => {
            onClose();
            onOpenCTA();
          }}
          className="text-[#f8f4ee] hover:text-[#d4a373] uppercase tracking-wider underline underline-offset-4"
        >
          Let&apos;s Talk &rarr;
        </button>
      </div>
    </div>
  );
}
