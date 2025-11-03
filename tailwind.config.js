/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      colors: {
        // Severity Colors
        'critical': '#dc2626',
        'critical-light': '#fef2f2',
        'critical-dark': '#991b1b',
        'high': '#ea580c',
        'high-light': '#fff7ed',
        'high-dark': '#9a3412',
        'medium': '#ca8a04',
        'medium-light': '#fefce8',
        'medium-dark': '#854d0e',
        'low': '#2563eb',
        'low-light': '#eff6ff',
        'low-dark': '#1e40af',
        'info': '#6b7280',
        'info-light': '#f9fafb',
        'info-dark': '#374151',
        
        // Status Colors
        'success': '#16a34a',
        'success-light': '#f0fdf4',
        'warning': '#f59e0b',
        'warning-light': '#fffbeb',
        'danger': '#dc2626',
        'danger-light': '#fef2f2',
        
        // UI Colors
        'sidebar-bg': '#0f172a',
        'sidebar-item': '#1e293b',
        'sidebar-active': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
