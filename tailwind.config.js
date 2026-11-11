/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          50: "#f5f3ff",
          100: "#e4e4fd",
          200: "#d4d4f7",
          300: "#c4c4e8",
          400: "#a7a7d3",
          500: "#8b8bd9",
          600: "#7676c5",
          700: "#6666ae",
          800: "#595994",
          900: "#4f4f7d",
          950: "#1e1e37",
        },
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#eab308",
          700: "#ca8a04",
          800: "#a16207",
          900: "#854d0e",
          950: "#4d2a02",
        },
        blue: {
          50: "#eff6ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7fcdfd",
          400: "#3b82f6",
          500: "#1d4ed8",
          600: "#1e40af",
          700: "#2563eb",
          800: "#1d4ed8",
          900: "#1e40af",
          950: "#1e40af",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}