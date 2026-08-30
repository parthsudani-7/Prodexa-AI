/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0D10",
          sidebar: "#0F1115",
          surface: "#14171C",
          elevated: "#191D24",
          card: "#14171C",
        },
        surface: {
          DEFAULT: "#14171C",
          light: "#191D24",
          elevated: "#191D24",
          card: "#14171C",
        },
        border: {
          DEFAULT: "#262B33",
          subtle: "#1C2128",
          active: "#3A424E",
        },
        brand: {
          DEFAULT: "#5B8DEF",
          hover: "#6B9BFF",
          light: "#7BA8FF",
          neon: "#9CBFFF",
          muted: "rgba(91, 141, 239, 0.15)",
        },
        success: {
          DEFAULT: "#32C48D",
          hover: "#28AC7B",
          muted: "rgba(50, 196, 141, 0.12)",
        },
        warning: {
          DEFAULT: "#E6A23C",
          hover: "#CC8B2D",
          muted: "rgba(230, 162, 60, 0.12)",
        },
        danger: {
          DEFAULT: "#E05B68",
          hover: "#C94956",
          muted: "rgba(224, 91, 104, 0.12)",
        },
        info: {
          DEFAULT: "#5B9DFF",
          muted: "rgba(91, 157, 255, 0.12)",
        },
        text: {
          primary: "#F4F6F8",
          secondary: "#9AA3AF",
          muted: "#828C99",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.25)",
        card: "0 2px 6px 0 rgba(0, 0, 0, 0.35)",
        modal: "0 12px 32px 0 rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
}
