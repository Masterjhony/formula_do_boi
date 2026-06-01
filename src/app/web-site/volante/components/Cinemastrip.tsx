'use client'

import { motion } from 'framer-motion'

export function Cinemastrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      aria-label="Volante MRA · Pelagem branca de tipicidade"
      className="relative overflow-hidden border-b border-bronze-500/20"
      style={{
        backgroundImage: "url('/volante/volante-pasto.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        // Brandbook §08 · cinematic warm shadows
        filter: 'brightness(0.65) contrast(1.20) saturate(0.78) sepia(0.05)',
        height: 'clamp(260px, 36vw, 360px)',
      }}
    >
      {/* Gradient ::before — fade top + fade bottom para o preto */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, #000000 0%, transparent 30%, transparent 70%, #000000 100%)',
        }}
      />

      {/* Quote · bottom-left */}
      <p
        className="absolute font-medium text-selo max-w-[720px]"
        style={{
          left: '6vw',
          right: '6vw',
          bottom: 'clamp(24px, 4vw, 36px)',
          fontSize: 'clamp(18px, 2.2vw, 30px)',
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
      >
        Genética que se vê <i className="italic text-bronze-300">no campo.</i>
        <br />
        E se mede no <i className="italic text-bronze-300">frigorífico.</i>
      </p>
    </motion.section>
  )
}
