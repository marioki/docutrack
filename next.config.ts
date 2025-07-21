/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  },
};

module.exports = nextConfig;
