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
        fadeZoomIn: {
          '0%': { opacity: 0, transform: 'scale(0.8)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'logo-appear': 'fadeZoomIn 0.8s ease-out forwards',
        scroll: 'scroll 5s linear infinite',
        like: 'like 0.3s ease-in-out',
        micGrow: 'micGrow 1.2s ease-in-out infinite',
        'custom-ping': 'customPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          'color-scheme': 'dark',
          '--color-base-100': 'oklch(0 0 315)', // ✏️ 너가 바꾼 값
          '--color-base-200': 'oklch(0 0 320)',
          '--color-base-300': 'oklch(0 0 325)',
          '--color-primary': 'oklch(62% 0.19 248)', // 원래 기본 primary
          '--color-secondary': 'oklch(72% 0.16 191)',
          '--color-accent': 'oklch(80% 0.24 125)',
          '--color-neutral': 'oklch(24% 0.02 280)',
          '--color-info': 'oklch(72% 0.08 215)',
          '--color-success': 'oklch(70% 0.12 145)',
          '--color-warning': 'oklch(90% 0.16 90)',
          '--color-error': 'oklch(68% 0.19 25)',
          // 필요한 것 추가 가능
        },
      },
    ],
  },
};
