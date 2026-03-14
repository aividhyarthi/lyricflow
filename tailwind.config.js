/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        bg:      '#09090f',
        surface: '#111118',
        s2:      '#18181f',
        s3:      '#202028',
        accent:  '#b96ef5',
        gold:    '#f6c026',
      },
    },
  },
  plugins: [],
}
