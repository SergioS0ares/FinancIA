/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Ativa o modo escuro via classe .dark no <html>
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cores semânticas que mudam dinamicamente
        background: 'var(--color-background)', // Fundo global da tela (Dark Navy ou Light Gray)
        textPrimary: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        borderBase: 'var(--color-border-base)',

        // Cores fixas da marca (iguais em ambos os modos)
        ouro: '#c69634',
        ouroGlow: 'rgba(198, 150, 52, 0.45)',
        ciano: '#30f0f0',
        cianoLight: 'rgba(48, 240, 240, 0.1)',

        // Cartão de login (claro / escuro via CSS vars)
        loginCard: 'var(--color-login-card-bg)',
        loginCardBorder: 'var(--color-login-card-border)',
        loginCardText: 'var(--color-login-card-text)',
        loginCardMuted: 'var(--color-login-card-muted)',

        whiteLogin: '#ffffff',
        textLoginDark: 'var(--color-login-card-text)',
        grayLight: '#e5e7eb',
      },
      boxShadow: {
        supimpa: '0 4px 10px rgba(0, 0, 0, 0.1)',
        loginCard: 'var(--color-login-card-shadow)',
      },
    },
  },
  plugins: [],
};
