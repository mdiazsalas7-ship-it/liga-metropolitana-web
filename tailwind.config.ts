import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        liga: {
          coral:     '#D85A30',
          coralSoft: '#FAECE7',
          coralDark: '#993C1D',
          navy:      '#0d1f4a',
          dark:      '#18181b',
          darkSoft:  '#27272a',
          gold:      '#d97706',
          goldSoft:  '#fef3c7',
          live:      '#dc2626',
          liveSoft:  '#fef2f2',
          final:     '#059669',
          finalSoft: '#ecfdf5',
        },
        // Aliases para compatibilidad con código viejo (paleta dark)
        'liga-orange':    '#D85A30',
        'liga-navy':      '#0d1f4a',
        'liga-darkNavy':  '#020c1b',
        'liga-gold':      '#d97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
