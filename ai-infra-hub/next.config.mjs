/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用某些严格检查以允许在缺少环境变量时构建
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
