/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hinge-inspired black & white palette
        primary: {
          DEFAULT: '#000000',
          light: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          light: '#F5F5F5',
        },
        accent: {
          DEFAULT: '#000000',
          light: '#333333',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#000000',
        },
        text: {
          primary: '#000000',
          secondary: '#666666',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        'mobile': '20px',
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'input': '10px',
      },
      boxShadow: {
        'button': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

