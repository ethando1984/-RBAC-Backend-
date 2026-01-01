/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f7ff',
                    100: '#ebf0fe',
                    200: '#ced9fd',
                    300: '#b1c2fb',
                    400: '#7694f8',
                    500: '#3b66f5',
                    600: '#355cdc',
                    700: '#2c4dafb',
                    800: '#233d93',
                    900: '#1d3278',
                },
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
