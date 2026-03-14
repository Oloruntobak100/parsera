import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#131b2e',
          raised: '#1a2438',
          input: '#0f1624',
        },
        /* Parséra-style yellow / amber accent */
        accent: {
          DEFAULT: '#f5c518',
          dim: '#d4a10e',
          glow: '#fde047',
          muted: 'rgba(245, 197, 24, 0.14)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 24px -6px rgba(245, 197, 24, 0.4)',
        'glow-md': '0 0 48px -12px rgba(245, 197, 24, 0.25)',
        panel:
          '0 4px 24px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
}
export default config
