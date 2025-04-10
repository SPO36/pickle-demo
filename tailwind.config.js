module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // ← 꼭 있어야 함!
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'tranbaseY(0)' },
          '100%': { transform: 'tranbaseY(-100%)' },
        },
      },
      animation: {
        scroll: 'scroll 5s linear infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['wireframe'],
  },
};
