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
          { label: "Reports", slug: "assessors/dashboard/reports" },
          { label: "Forms", slug: "assessors/dashboard/forms" },
          { label: "Settings", slug: "assessors/dashboard/settings" },
        ],
      },
      {
        collapsed: true,
        label: "Grant",
        items: [
          {
            label: "Dashboard",
            items:[
              {label:"Grant Dashboard", slug:"assessors/grant/grant-dashboard/dashboard"},
              {label:"Advanced Filtering", slug:"assessors/grant/grant-dashboard/advanced-filtering"},
            ],
            // slug: "assessors/grant/dashboard",
          },
          { 
            collapsed:true,
            label: "Grant Settings", 
            items:[
              {label:"Grant Management", slug:"assessors/grant/grant-settings/grant-management"},
              {label:"Assessors", slug:"assessors/grant/grant-settings/assessors"},
              {label:"Email templates", slug:"assessors/grant/grant-settings/email-templates"},
              {label:"Application Report Export", slug:"assessors/grant/grant-settings/application-report-export"},
              {label:"Application Stages", slug:"assessors/grant/grant-settings/application-stages"},
              {label:"Contracts and Letters", slug:"assessors/grant/grant-settings/contracts-and-letters"},
              {label:"Form Templates", slug:"assessors/grant/grant-settings/form-templates"},
            ]
            // slug: "assessors/grant/settings" 
          },
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
            slug: "assessors/grant/application/attachments",
          },
          {
            label: "Payments",
            slug: "assessors/grant/application/payments",
          },
          {
            label:"Hisory and Comments",
            slug:"assessors/grant/application/history-and-comments",
          }
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
