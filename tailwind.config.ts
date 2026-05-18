import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const luxeSky = {
  50: '#f7f6f4',
  100: '#eeedea',
  200: '#e0e2e6',
  300: '#c8cdd4',
  400: '#a8b0bc',
  500: '#8e9aae',
  600: '#768294',
  700: '#5f6a7a',
  800: '#4d5664',
  900: '#404852',
  950: '#2a2e34',
} as const

const luxeAmber = {
  50: '#faf8f5',
  100: '#f5f0e8',
  200: '#ebe3d4',
  300: '#dfd2bc',
  400: '#d4c4a8',
  500: '#c4b090',
  600: '#a89472',
  700: '#8a7860',
  800: '#6e6050',
  900: '#5a4f42',
  950: '#332e28',
} as const

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sky: luxeSky,
        amber: luxeAmber,
        nora: {
          bg: '#1a1824',
          accent: '#b8c4d4',
          accent2: '#d4c4a8',
          border: 'rgba(255, 255, 255, 0.1)',
          glass: 'rgba(42, 40, 38, 0.72)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        luxe: '0.06em',
      },
      boxShadow: {
        neon: '0 0 0 1px color-mix(in srgb, var(--nora-accent-2) 32%, transparent), 0 10px 32px -8px var(--nora-glow)',
        'neon-lg':
          '0 0 0 1px color-mix(in srgb, var(--nora-accent-2) 40%, transparent), 0 16px 48px -12px var(--nora-glow)',
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
        theme: '380ms',
        smooth: '280ms',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
        nora: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
