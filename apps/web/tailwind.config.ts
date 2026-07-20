import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A5C',
          deep: '#122A44',
        },
        gold: {
          DEFAULT: '#C9A227',
          soft: '#E4C878',
        },
        sea: {
          DEFAULT: '#4FA8C9',
          deep: '#2F6690',
        },
        paper: '#FBF9F4',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
    },
  },
};

export default config;
