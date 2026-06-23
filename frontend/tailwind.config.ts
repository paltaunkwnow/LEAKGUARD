import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        primary: "var(--primary)",
        muted: "var(--muted)",
        agentory: {
          orange: "#ff5722",
          "orange-hover": "#ff6b3d",
          surface: "#111111",
          elevated: "#161616",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Fragment Mono", "ui-monospace", "monospace"],
      },
      opacity: {
        "3": "0.03",
        "6": "0.06",
        "8": "0.08",
        "15": "0.15",
      },
      backgroundOpacity: {
        "3": "0.03",
        "6": "0.06",
        "8": "0.08",
        "15": "0.15",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "globe-pulse": "globePulse 4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        globePulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
