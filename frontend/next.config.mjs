/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: [
    '@make-software/csprclick-ui', 
    '@make-software/cspr-design',
    '@make-software/csprclick-core-client',
    '@make-software/csprclick-core-types'
  ]
};

export default nextConfig;
