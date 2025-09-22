/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicione esta seção de 'images' para permitir o domínio externo.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;