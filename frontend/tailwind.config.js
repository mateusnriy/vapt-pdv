/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FBF7F1',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F3ECE1',
        },
        border: {
          DEFAULT: '#E5DACB',
        },
        text: {
          DEFAULT: '#2B2019',
          2: '#6A5849',
        },
        brand: {
          DEFAULT: '#F2A81D',
          soft: '#FDF0D2',
          text: '#8A5200',
        },
        'on-brand': '#2B2019',
        nav: '#3A2A21',
        success: {
          DEFAULT: '#2F7D4F',
          soft: '#DDF0E4',
        },
        danger: {
          DEFAULT: '#C4391D',
          soft: '#FBE3DC',
        },
        tint: {
          beer: '#FBE6B8',
          snack: '#E4EFD5',
          drink: '#F8D9CC',
          dessert: '#EBDDCB',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        input: '14px',
        card: '20px',
        'card-lg': '24px',
        btn: '18px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 32, 25, 0.06)',
        card: '0 2px 8px rgba(43, 32, 25, 0.08)',
        modal: '0 16px 32px rgba(43, 32, 25, 0.16)',
      },
    },
  },
  plugins: [],
};
