import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

import icon from "astro-icon";

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
          label: "Onboarding",
          items: [
            {
              label: "Create a Grant Program",
              slug: "guides/how-to/assessors/create-a-grant-program",
            },
            {
              label: "Add Criteria",
              slug: "guides/how-to/assessors/add-criteria",
            },
            {
              label: "Design and Customise Forms",
              slug: "guides/how-to/assessors/design-and-customise-forms",
            },
          ],
        },
        {
          label: "Dashboard",
          items: [
            {
              label: "Grants List",
              slug: "guides/how-to/assessors/add-criteria",
            },
            { label: "Reports", slug: "guides/how-to/assessors/add-criteria" },
            { label: "Forms", slug: "guides/how-to/assessors/add-criteria" },
            { label: "Settings", slug: "guides/how-to/assessors/add-criteria" },
          ],
        },
        {
          label: "Grant",
          items: [
            {
              label: "Dashboard",
              slug: "guides/how-to/assessors/add-criteria",
            },
            { label: "Settings", slug: "guides/how-to/assessors/add-criteria" },
            {
              label: "Detail",
              items: [
                {
                  label: "Application Detail",
                  slug: "guides/how-to/assessors/add-criteria",
                },
                {
                  label: "Attachments",
                  slug: "guides/how-to/assessors/add-criteria",
                },
                {
                  label: "Payments",
                  slug: "guides/how-to/assessors/add-criteria",
                },
              ],
            },
          ],
        },
        {
          label: "Trust Center",
          items: ["trust-center/compliance"],
        },
        {
          label: "Changelog",
          items: ["changelog/october-2024"],
        },
      ],
    }),
    mdx(),
    icon(),
  ],
});
