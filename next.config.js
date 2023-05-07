/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'koistudy.net',
			},
			{
				protocol: 'https',
				hostname: 'cdn.ecdev.me',
			},
		],
	},
};

module.exports = nextConfig;
