import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GrantPilot — AI-Powered Grant Intelligence",
    short_name: "GrantPilot",
    description:
      "Find grants you'll win. AI fills applications to 100/100, optimized for each funder's scoring criteria.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
