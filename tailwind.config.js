/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    0: '#0a0a0a',
                    1: '#111111',
                    2: '#1a1a1a',
                    3: '#242424',
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
