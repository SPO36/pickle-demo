module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateY(0)' }, // 오타 수정
          '100%': { transform: 'translateY(-100%)' },
        },
        like: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        micGrow: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        customPing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        scroll: 'scroll 5s linear infinite',
        like: 'like 0.3s ease-in-out',
        micGrow: 'micGrow 1.2s ease-in-out infinite',
        'custom-ping': 'customPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [require('daisyui')],
};
