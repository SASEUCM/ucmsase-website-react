/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sase-blue': '#1A54C4',
        'sase-red': '#dc2626',
      },
    },
  },
  plugins: [],
  // Important: Since you're using @aws-amplify/ui-react, we need to make sure
  // Tailwind doesn't purge its styles
  safelist: [
    {
      pattern: /^amplify-/,
    }
  ]
}