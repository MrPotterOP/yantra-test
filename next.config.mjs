/** @type {import('next').NextConfig} */
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
    // Sharp and other native modules must not be bundled — let Node require them
    serverExternalPackages: ['sharp', 'cloudinary'],

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
};

export default withPayload(nextConfig)
