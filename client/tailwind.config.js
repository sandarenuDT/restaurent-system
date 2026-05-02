/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff8f0",
          100: "#ffecd6",
          200: "#ffd4a8",
          300: "#ffb570",
          400: "#ff8c35",
          500: "#f97316",  // Main orange
          600: "#ea6c0a",
          700: "#c2550a",
          800: "#9a450e",
          900: "#7c3a0f",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "slide-down": "slideDown 0.3s ease forwards",
        "pulse-dot":  "pulseDot 1.5s ease-in-out infinite",
        "spin-slow":  "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 },                      to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideDown:{ from: { opacity: 0, transform: "translateY(-10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseDot: { "0%,100%": { opacity: 1, transform: "scale(1)" }, "50%": { opacity: 0.5, transform: "scale(0.8)" } },
      },
    },
  },
  plugins: [],
};