/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project is an API-only backend (no UI). Route handlers under
  // app/api/** are what matters — see middleware.js for CORS handling.
  reactStrictMode: true,
};

export default nextConfig;
