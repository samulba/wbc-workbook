/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["workbooks.wellbeing-concepts.de", "localhost:3000"],
    },
  },
};

export default nextConfig;
