/** @type {import('tailwindcss').Config} */
export default {
  // Enforce Light Mode ONLY (disable automatic dark media queries)
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Primary unified font stack: Google Sans for Latin glyphs, Kantumruy Pro for Khmer glyphs
        sans: ['"Google Sans"', '"Kantumruy Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        khmer: ['"Kantumruy Pro"', 'sans-serif'],
        latin: ['"Google Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // High-contrast, accessibility-focused government palette
        gov: {
          primary: {
            DEFAULT: '#1E3A8A', // Deep Administrative Navy
            hover: '#172554',
            light: '#EFF6FF',
          },
          secondary: {
            DEFAULT: '#0D9488', // Verification / Trust Teal
            hover: '#0F766E',
            light: '#F0FDFA',
          },
          surface: '#F8FAFC',   // Crisp administrative background
          card: '#FFFFFF',      // Pure white card background
          border: '#E2E8F0',    // Slate 200 border
          text: {
            primary: '#0F172A',  // Slate 900
            secondary: '#475569',// Slate 600
            muted: '#64748B',    // Slate 500
          },
          gold: '#B45309',      // National insignia subtle accent
        }
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'gov-md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'gov-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
