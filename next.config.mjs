/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SYNCFUSION_LICENSE_KEY: process.env.SYNCFUSION_LICENSE_KEY,
    NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY: process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY,
  },
  transpilePackages: [
    '@syncfusion/ej2-base',
    '@syncfusion/ej2-buttons',
    '@syncfusion/ej2-calendars',
    '@syncfusion/ej2-dropdowns',
    '@syncfusion/ej2-inputs',
    '@syncfusion/ej2-lists',
    '@syncfusion/ej2-navigations',
    '@syncfusion/ej2-popups',
    '@syncfusion/ej2-schedule',
    '@syncfusion/ej2-react-schedule'
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
}

export default nextConfig;
