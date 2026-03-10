'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function InstagramButton() {
  return (
    <motion.a
      href="https://www.instagram.com/nishinihongogakko/"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-2"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      title="Seguinos en Instagram @nishinihongogakko"
    >
      {/* Nishi logo */}
      <div className="relative w-9 h-9 md:w-10 md:h-10">
        <Image
          src="/nishi-logo-card.png"
          alt="Nishi Nihongo Gakko"
          width={40}
          height={40}
          className="w-full h-full object-contain drop-shadow-lg transition-all duration-300"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255, 45, 149, 0.4))',
          }}
          unoptimized
        />

        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: '0 0 15px rgba(255, 45, 149, 0.5), 0 0 30px rgba(255, 45, 149, 0.3)',
          }}
        />
      </div>

      {/* Tooltip */}
      <span className="text-[10px] text-gray-500 group-hover:text-[#ff2d95] transition-colors whitespace-nowrap">
        @nishinihongogakko
      </span>
    </motion.a>
  );
}
