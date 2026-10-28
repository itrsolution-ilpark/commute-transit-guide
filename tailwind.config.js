/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        accent: "#10B981",
        danger: "#EF4444",
        bgBase: "#F8FAFC",
        surface: "#FFFFFF",
        textMain: "#0F172A",
        textSub: "#64748B",
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
