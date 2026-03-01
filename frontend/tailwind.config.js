/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(240 10% 4%)",
                foreground: "hsl(0 0% 98%)",
                primary: {
                    DEFAULT: "hsl(262 83% 58%)",
                    foreground: "hsl(0 0% 98%)",
                },
                secondary: {
                    DEFAULT: "hsl(240 5% 10%)",
                    foreground: "hsl(0 0% 98%)",
                },
                accent: {
                    DEFAULT: "hsl(262 83% 58%)",
                    foreground: "hsl(0 0% 98%)",
                },
                border: "hsl(240 5% 15%)",
                card: "hsl(240 10% 6%)",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
