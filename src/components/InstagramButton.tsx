'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function InstagramButton() {
  return (
    <motion.a
      href="https://www.instagram.com/nishinihongogakko/"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-1.5"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Seguinos en Instagram @nishinihongogakko"
    >
      {/* Nishi logo — untouched, no filters */}
      <div className="relative w-7 h-7 md:w-8 md:h-8">
        <Image
          src="/nishi-logo-card.png"
          alt="Nishi Nihongo Gakko"
          width={32}
          height={32}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
      <span
        className="text-[10px] transition-colors whitespace-nowrap group-hover:underline"
        style={{ color: 'var(--color-sepia)' }}
      >
        @nishinihongogakko
      </span>
    </motion.a>
  );
}
