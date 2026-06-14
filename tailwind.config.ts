import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        liga: {
          coral:     '#FF5A30',
          coralSoft: 'rgba(255,90,48,0.13)',
          coralDark: '#c7401f',
          navy:      '#0d1f4a',
          dark:      '#0d121f',
          darkSoft:  '#1b2333',
          card:      '#141a28',
          card2:     '#1b2333',
          gold:      '#FFC542',
          goldSoft:  'rgba(255,197,66,0.14)',
          live:      '#FF3B3B',
          liveSoft:  'rgba(255,59,59,0.12)',
          final:     '#7CFF6B',
          finalSoft: 'rgba(124,255,107,0.12)',
        },
        // Aliases de compatibilidad
        'liga-orange':    '#FF5A30',
        'liga-navy':      '#0d1f4a',
        'liga-darkNavy':  '#020c1b',
        'liga-gold':      '#FFC542',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        cond: ['var(--font-cond)', 'Barlow Condensed', 'Archivo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
