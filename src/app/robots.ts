import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grantpilot.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/student/",
          "/api/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
