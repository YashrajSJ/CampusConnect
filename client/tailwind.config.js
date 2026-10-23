/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        midnight: {
          DEFAULT: "#00072D",
          hover: "#0a1744",
          light: "rgba(0, 7, 45, 0.08)",
        },
        brand: {
          50: "#e6eaf3",
          100: "#ccd5e7",
          500: "#00072D",
          600: "#00072D",
          700: "#000520",
          900: "#00020c",
        },
      },
    },
  },
  plugins: [],
};
