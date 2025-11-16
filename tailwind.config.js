/** @type {import('tailwindcss').Config} */
export default {
  // This 'content' array tells Tailwind CSS where to look for your CSS classes.
  // It's crucial for Tailwind to generate the correct CSS.
  content: [
    "./index.html", // Your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All JavaScript, TypeScript, JSX, and TSX files in your src directory
  ],
  theme: {
    extend: {
      // You can extend Tailwind's default theme here.
      // For example, adding a custom font family:
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // You can also add custom colors, spacing, etc.
    },
  },
  plugins: [], // Add any Tailwind CSS plugins here
}
