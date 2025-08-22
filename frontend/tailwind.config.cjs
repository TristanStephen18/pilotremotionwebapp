/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          600: "#2563eb", // pick any color you want
          700: "#1d4ed8", // darker shade for hover
        },
      },
    },
  },
  plugins: [],
}
