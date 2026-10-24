'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onOpenModal: () => void;
  onOpenMenu: () => void;
  isDarkTheme?: boolean;
}

export default function Header({
  onOpenModal,
  onOpenMenu,
  isDarkTheme = false,
}: HeaderProps) {
  const [time, setTime] = useState('00:00');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Dubai',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date())
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60_000);

    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const textColor = isDarkTheme ? 'text-[#f8f4ee]' : 'text-[#121212]';
  const borderColor = isDarkTheme ? 'border-white/10' : 'border-black/10';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b px-5 py-4 transition-all duration-500 md:px-12 md:py-5 ${
        isScrolled
          ? 'border-black/[0.08] bg-[#f8f4ee]/90 shadow-[0_8px_32px_rgba(18,18,18,0.04)] backdrop-blur-xl'
          : 'border-transparent bg-[#f8f4ee]/15 backdrop-blur-sm'
      } ${textColor}`}
    >
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="group flex items-center gap-3 font-sans text-sm font-bold uppercase tracking-widest"
        >
          <span className="font-serif text-2xl font-normal italic leading-none tracking-tighter transition-colors group-hover:text-[#a97849]">
            L
          </span>
          <span className="tracking-[0.28em]">LENVAL</span>
        </Link>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav className="hidden items-center gap-9 text-[10px] font-medium uppercase tracking-[0.18em] md:flex">
        <Link
          href="/#about"
          className="relative py-1 group overflow-hidden"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
            About Us
          </span>
          <span className="absolute left-0 top-full inline-block transition-transform duration-300 group-hover:-translate-y-full">
            About Us
          </span>
        </Link>
        <Link
          href="/#projects"
          className="relative py-1 group overflow-hidden"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
            Projects
          </span>
          <span className="absolute left-0 top-full inline-block transition-transform duration-300 group-hover:-translate-y-full">
            Projects
          </span>
        </Link>
        <Link
          href="/#services"
          className="relative py-1 group overflow-hidden"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
            Philosophy
          </span>
          <span className="absolute left-0 top-full inline-block transition-transform duration-300 group-hover:-translate-y-full">
            Philosophy
          </span>
        </Link>
      </nav>

      {/* Right: UAE Time + CTA Button + Mobile Toggle */}
      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-2.5 border-r border-black/10 pr-6 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a97849]" />
          <span>{time}</span>
          <span className="text-black/40">Abu Dhabi</span>
        </div>

        <button
          onClick={onOpenModal}
          className={`group relative hidden items-center gap-3 overflow-hidden rounded-full border ${borderColor} px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-all duration-300 hover:border-[#a97849] hover:bg-[#171816] hover:text-[#f8f4ee] active:scale-95 sm:flex`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#a97849] transition-colors group-hover:bg-[#d4a373]"></span>
          <span className="relative z-10 font-medium">Let&apos;s Talk</span>
        </button>

        {/* Hamburger Menu Toggle (Mobile & Desktop) */}
        <button
          onClick={onOpenMenu}
          aria-label="Open Menu"
          className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border ${borderColor} transition-all duration-300 hover:border-[#a97849] hover:bg-[#171816] hover:text-[#f8f4ee]`}
        >
          <span className="w-5 h-[1.5px] bg-current"></span>
          <span className="w-3.5 h-[1.5px] bg-current self-end"></span>
        </button>
      </div>
    </header>
  );
}
