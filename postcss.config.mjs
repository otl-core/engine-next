// Only use tailwind postcss in non-test environments
const config = {
  plugins: process.env.VITEST ? [] : ["@tailwindcss/postcss"],
};

export default config;
