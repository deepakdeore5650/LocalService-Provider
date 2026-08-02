module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070912',
          900: '#0B1020',
          800: '#111827',
          700: '#1E1B4B',
        },
        primary: {
          500: '#6366F1',
          600: '#7C3AED',
        },
        accent: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(135deg,#0B1020,#111827,#1E1B4B)',
        'btn-gradient': 'linear-gradient(135deg,#6366F1,#7C3AED)',
        'accent-gradient': 'linear-gradient(135deg,#F59E0B,#FBBF24)',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -18px rgba(124,58,237,0.55)',
        'glow-accent': '0 0 0 1px rgba(255,255,255,0.08), 0 16px 40px -14px rgba(245,158,11,0.5)',
        card: '0 1px 1px rgba(0,0,0,0.2), 0 12px 32px -14px rgba(0,0,0,0.55)',
        'card-hover': '0 1px 1px rgba(0,0,0,0.25), 0 30px 60px -20px rgba(99,102,241,0.35)',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.94)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blur-in': {
          '0%': { opacity: '0', filter: 'blur(8px)', transform: 'translateY(16px)' },
          '100%': { opacity: '1', filter: 'blur(0px)', transform: 'translateY(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        blob: 'blob 14s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};
