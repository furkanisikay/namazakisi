/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Rozet seviyeleri - mat tonlar
                badge: {
                    bronze: '#CD7F32',
                    silver: '#C0C0C0',
                    gold: '#D4AF37',
                    diamond: '#7BB3CC',
                },
                // Birincil renkler (varsayilan zumrut tema)
                primary: {
                    DEFAULT: '#4CAF50',
                    dark: '#388E3C',
                    light: '#C8E6C9',
                },
            },
        },
    },
    plugins: [],
}
