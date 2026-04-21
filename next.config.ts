import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "*.googleusercontent.com",
        protocol: "https",
      },
      {
        hostname: "avatar.vercel.sh",
        protocol: "https",
      },
      {
        hostname: "4tx3fsttma.ufs.sh",
        protocol: "https",
      },
      {
        hostname: "gravatar.com",
        protocol: "https",
      },
      {
        hostname: "cdni.pornpics.com",
        protocol: "https",
      },
      {
        hostname: "e9aotq8tou.ufs.sh",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
