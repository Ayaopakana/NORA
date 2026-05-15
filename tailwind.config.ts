import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        nora: {
          bg: '#020617',
          accent: '#38bdf8',
          accent2: '#2563eb',
          border: 'rgba(37, 99, 235, 0.18)',
          glass: 'rgba(15, 23, 42, 0.45)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(56, 189, 248, 0.35), 0 0 24px rgba(56, 189, 248, 0.25)',
        'neon-lg':
          '0 0 0 1px rgba(56, 189, 248, 0.45), 0 0 40px rgba(56, 189, 248, 0.35)',
        glass: 'var(--nora-shadow-glass)',
        'glass-lg': 'var(--nora-shadow-glass-lg)',
      },
      backdropBlur: {
        glass: '22px',
        'glass-lg': '32px',
      },
      borderRadius: {
        glass: 'var(--nora-radius)',
        'glass-lg': 'var(--nora-radius-lg)',
      },
      transitionDuration: {
        theme: '320ms',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
