import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
    images:{
        remotePatterns:[
            new URL("https://res.cloudinary.com/**")
        ]
    },
    // experimental:{
    //     serverActions:{
    //         bodySizeLimit: "10mb"
    //     }
    // }
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);