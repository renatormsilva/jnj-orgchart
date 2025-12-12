/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jnj: {
          red: '#EB1700',
          white: '#FFFFFF',
          gray: {
            900: '#000000',
            700: '#666666',
            400: '#D9D9D9',
            100: '#F2F2F2',
          },
          // Accent colors for badges and data visualization
          // Based on J&J brand guidelines accent palette
          accent: {
            green: {
              light: '#E8F5E9',
              DEFAULT: '#2E7D32',
              dark: '#1B5E20',
            },
            blue: {
              light: '#E3F2FD',
              DEFAULT: '#1976D2',
              dark: '#0D47A1',
            },
            purple: {
              light: '#F3E5F5',
              DEFAULT: '#7B1FA2',
              dark: '#4A148C',
            },
          },
        },
      },
      fontFamily: {
        // Using Arial as default font per J&J Brand Guidelines
        // In production, would use official 'Johnson Display' and 'Johnson Text' from J&J Brand Center
        display: ['"Johnson Display"', 'Arial', 'Helvetica', 'sans-serif'],
        body: ['"Johnson Text"', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
