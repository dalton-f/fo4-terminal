/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.js", "index.html"],
  theme: {
    extend: {
      fontFamily: {
        shareTechMono: ['"Share Tech Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
