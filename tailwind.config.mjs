/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'prohibition': ['Prohibition', 'Impact', 'Arial Black', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
        'darker-grotesque': ['Darker Grotesque', 'sans-serif'],
        'lexend-mega': ['Lexend Mega', 'sans-serif'],
      },
    },
  },
  plugins: [],
}