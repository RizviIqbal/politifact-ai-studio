/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#111827',
          container: '#1F2937',
          low: '#0F172A',
          high: '#374151',
          highest: '#4B5563',
          border: '#1E293B',
        },
        academic: {
          amber: '#D97706',
          gold: '#F59E0B',
          copper: '#C2410C',
          indigo: '#4F46E5',
          blue: '#3B82F6',
          slate: '#64748B',
        },
        truth: {
          'pants-fire': '#DC2626',
          'false': '#EA580C',
          'barely-true': '#D97706',
          'half-true': '#CA8A04',
          'mostly-true': '#65A30D',
          'true': '#059669',
        },
      },
      fontFamily: {
        masthead: ['"Newsreader"', '"Lora"', 'Georgia', 'serif'],
        headline: ['"Inter"', 'sans-serif'],
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        label: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Space Grotesk"', 'monospace'],
      },
    },
  },
  plugins: [],
};

