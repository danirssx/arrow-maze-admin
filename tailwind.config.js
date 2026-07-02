/** @type {import('tailwindcss').Config} */
// Design tokens mirror arrow-maze-client/design/README.md so the admin and the mobile
// client stay visually consistent. Font: Outfit (loaded via @fontsource/outfit).
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          900: "#3744D9",
          700: "#5262FB",
          500: "#6B78FF",
          300: "#9DA6FB",
          100: "#DDE2FF",
        },
        background: {
          DEFAULT: "#F4F5FF",
          soft: "#E9EBFA",
          card: "#FFFFFF",
        },
        text: {
          primary: "#0F0F0F",
          secondary: "#6B6F8A",
          muted: "#A1A6C3",
          inverse: "#FFFFFF",
        },
        border: {
          soft: "#D6DAF5",
        },
        reward: {
          gold: "#FFC83D",
          orange: "#F6A700",
          green: "#56D879",
        },
      },
    },
  },
  plugins: [],
};
