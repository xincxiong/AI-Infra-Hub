/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 忽略 ESLint 错误（仅用于构建）
  },
};

export default nextConfig;
