/** @type {import('next').NextConfig} */
const FUNDS_HUB_DEST = ["https://funds", "fronteraeficiente", "com"].join(".");
const LEGACY_DATA_HOST = ["funds-data", "fronteraeficiente", "com"].join(".");
const LEGACY_VERCEL_HOST = ["mcp-sfc-fics-colombia", "vercel", "app"].join(".");

const NON_MCP_MISSING = [
  {
    type: "header",
    key: "content-type",
    value: ".*application/json.*",
  },
  {
    type: "header",
    key: "accept",
    value: ".*text/event-stream.*",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: LEGACY_DATA_HOST }],
        missing: NON_MCP_MISSING,
        destination: FUNDS_HUB_DEST,
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: LEGACY_VERCEL_HOST }],
        missing: NON_MCP_MISSING,
        destination: FUNDS_HUB_DEST,
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/mcp",
        destination: "/api/mcp",
      },
      {
        source: "/sse",
        destination: "/api/mcp",
      },
      {
        source: "/",
        has: [
          {
            type: "header",
            key: "content-type",
            value: ".*application/json.*",
          },
        ],
        destination: "/api/mcp",
      },
      {
        source: "/",
        has: [
          {
            type: "header",
            key: "accept",
            value: ".*text/event-stream.*",
          },
        ],
        destination: "/api/mcp",
      },
    ];
  },
};

export default nextConfig;
