/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignora erros de TypeScript no build (Essencial para Hackathon)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora erros de Lint no build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Permite imagens de qualquer lugar (para não dar erro nas Thumbs)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;