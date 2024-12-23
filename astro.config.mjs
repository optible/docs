import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://support.optible.ai",
  integrations: [starlight({
    title: "Optible Help Documentations",
    customCss: ["./src/styles/custom.css", "@fontsource/poppins", "@fontsource/poppins/400.css", "@fontsource/poppins/500.css", "@fontsource/poppins/600.css", "@fontsource/poppins/700.css", "@fontsource/poppins/800.css", "@fontsource/poppins/900.css"],
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
      Header: './src/components/Header.astro',
      Sidebar: './src/components/Sidebar.astro',
    },
    sidebar: [
      {
        // label: "Assessors",
        // items: [
        //   {
        label: "Get Started",
        collapsed: true,
        items: [
          {
            label: "Create a Grant Program",
            slug: "assessors/create-a-grant-program",
          },
          {
            label: "Add Criteria",
            slug: "assessors/add-criteria",
          },
          {
            label: "Design and Customise Forms",
            slug: "assessors/design-and-customise-forms",
          },
        ],
      },
      {
        collapsed: true,
        label: "Dashboard",
        items: [
          {
            label: "Grants List",
            slug: "assessors/dashboard/grants-list",
          },
          { label: "Reports", slug: "assessors/add-criteria" },
          { label: "Forms", slug: "assessors/add-criteria" },
          { label: "Settings", slug: "assessors/add-criteria" },
        ],
      },
      {
        collapsed: true,
        label: "Grant",
        items: [
          {
            label: "Dashboard",
            slug: "assessors/grant/dashboard",
          },
          { label: "Settings", slug: "assessors/add-criteria" },
        ],
      },
      {
        collapsed: true,
        label: "Application",
        items: [
          {
            label: "Application Detail",
            slug: "assessors/grant/application",
          },
          {
            label: "Application Header",
            slug: "assessors/grant/application/header",
          },
          {
            label: "Criteria Ranking",
            slug: "assessors/grant/application/criteria-ranking",
          },
          {
            label: "Smart Insights",
            slug: "assessors/grant/application/smart-insights",
          },
          {
            label: "Attachments",
            slug: "assessors/add-criteria",
          },
          {
            label: "Payments",
            slug: "assessors/add-criteria",
          },
        ],
      },
      {
        collapsed: true,
        label: "Forms",
        autogenerate: { directory: 'assessors/forms' },
      },
      //   ]
      // },
      {
        collapsed: true,
        label: "Trust Center",
        items: [{ "label": "Compliance", "slug": "trust-center/compliance" }],
      },
      {
        collapsed: true,
        label: "Changelog",
        autogenerate: { directory: 'changelog' },
      },
      {
        collapsed: true,
        label: "Knowledge Base",
        autogenerate: { directory: 'knowledge-base' },
      }
    ],
  }), mdx(), icon(), tailwind()],

  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
