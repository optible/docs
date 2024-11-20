import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Optible Help Documentations",
      customCss: ["./src/styles/custom.css", "@fontsource/poppins"],
      social: {
        linkedin:
          "https://www.linkedin.com/company/optible-ai?originalSubdomain=au",
      },
      logo: {
        replacesTitle: true,
        light: "./src/assets/logo/logo-blue.svg",
        dark: "./src/assets/logo/logo-white.svg",
      },
      components: {
        // Pagination: "./src/starlight-overrides/Pagination.astro",
      },
      sidebar: [
        {
          label: "Assessors",
          items: [
            {
              label: "Get Started",
              items: [
                {
                  label: "Create a Grant Program",
                  slug: "guides/assessors/create-a-grant-program",
                },
                {
                  label: "Add Criteria",
                  slug: "guides/assessors/add-criteria",
                },
                {
                  label: "Design and Customise Forms",
                  slug: "guides/assessors/design-and-customise-forms",
                },
              ],
            },
            {
              collapsed: true,
              label: "Dashboard",
              items: [
                {
                  label: "Grants List",
                  slug: "guides/assessors/dashboard/grants-list",
                },
                { label: "Reports", slug: "guides/assessors/add-criteria" },
                { label: "Forms", slug: "guides/assessors/add-criteria" },
                { label: "Settings", slug: "guides/assessors/add-criteria" },
              ],
            },
            {
              collapsed: true,
              label: "Grant",
              items: [
                {
                  label: "Dashboard",
                  slug: "guides/assessors/grant/dashboard",
                },
                { label: "Settings", slug: "guides/assessors/add-criteria" },
                {
                  label: "Detail",
                  items: [
                    {
                      label: "Application Detail",
                      slug: "guides/assessors/add-criteria",
                    },
                    {
                      label: "Attachments",
                      slug: "guides/assessors/add-criteria",
                    },
                    {
                      label: "Payments",
                      slug: "guides/assessors/add-criteria",
                    },
                  ],
                },
              ],
            },
          ]
        },
        {
          collapsed: true,
          label: "Trust Center",
          items: [{ "label": "Compliance", "slug": "trust-center/compliance" }],
        },
        {
          collapsed: true,
          label: "Changelog",
          items: ["changelog/october-2024"],
        },
      ],
    }),
    mdx(),
    icon(),
  ],

  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
