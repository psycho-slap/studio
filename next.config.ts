import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/su/lk',
        permanent: true,
      },
      {
        source: '/app/tracker',
        destination: '/su/app/tracker',
        permanent: true,
      },
      {
        source: '/app/add-order',
        destination: '/su/app/add-order',
        permanent: true,
      },
      {
        source: '/app/customers',
        destination: '/su/app/customers',
        permanent: true,
      },
      {
        source: '/app/customers/:path*',
        destination: '/su/app/customers/:path*',
        permanent: true,
      },
       {
        source: '/app/completed',
        destination: '/su/app/completed',
        permanent: true,
      },
    ]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
