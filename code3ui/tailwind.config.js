/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'udos-primary': '#00ff9d',
        'udos-secondary': '#00b4d8',
        'udos-surface': '#161b22',
        'udos-surface-light': '#24292e',
        'udos-border': '#30363d',
        'udos-text': '#e1e4e8',
        'udos-text-muted': '#8b949e',
      },
    },
  },
  plugins: [],
}
