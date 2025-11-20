# Plain Help Center Migration Tool

This tool migrates your Astro/Starlight documentation to Plain's Help Center, including automatic conversion of images to base64 format.

## Features

- ✅ **Full Content Sync**: Deletes existing content and re-imports everything for a clean migration
- 📁 **Hierarchical Structure**: Maintains your folder structure as article groups
- 🖼️ **Image Upload**: Automatically uploads local images to Plain's CDN using the workspace file API
- 💾 **Image Caching**: Caches uploaded images to avoid re-uploading duplicates
- 📝 **Frontmatter Support**: Reads title, description, slug, and draft status from frontmatter
- 🔄 **Smart Fallbacks**: Auto-generates titles and descriptions if not provided
- 🎯 **Error Handling**: Continues processing even if individual files fail

## Prerequisites

1. A Plain account with API access
2. A Help Center created in Plain
3. Node.js installed (v18 or higher recommended)

## Setup

### 1. Install Dependencies

The required dependencies should already be in your `package.json`:

```json
{
  "dependencies": {
    "graphql-request": "^latest",
    "marked": "^latest",
    "form-data": "^latest"
  }
}
```

Run:
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Plain API Configuration
PLAIN_API_TOKEN=plainApiKey_YOUR_API_KEY_HERE
PLAIN_HELP_CENTER_ID=hc_YOUR_HELP_CENTER_ID_HERE
```

**Note:** The script also reads from `astro.config.mjs` to use your custom slugs automatically.

#### How to Get Your Credentials:

**API Token:**
1. Go to Plain Settings → API Keys
2. Create a new API key with Help Center write permissions
3. Copy the key (starts with `plainApiKey_`)

**Help Center ID:**
1. Go to your Help Center in Plain
2. Look at the URL: `https://app.plain.com/workspaces/[workspace]/help-centers/[help-center-id]`
3. Copy the help center ID (starts with `hc_`)

## Usage

### Run the Migration

```bash
npx tsx plain.ts
```

Or if you have ts-node:
```bash
ts-node plain.ts
```

### What Happens

The script performs two main steps:

#### Step 1: Cleanup
- Fetches all existing articles in the Help Center
- Deletes all articles
- Fetches all existing article groups
- Deletes all article groups (children first, then parents)

#### Step 2: Import
- Recursively processes your `src/content/docs` directory
- Creates article groups for each folder
- Processes each `.md` and `.mdx` file:
  - Extracts frontmatter (title, description, slug, draft)
  - Converts local images to base64
  - Converts markdown to HTML
  - Creates/updates the article in Plain

## Image Handling

The script automatically uploads images referenced in your markdown to Plain's CDN:

**Before:**
```markdown
![Dashboard](/images/guides/grant-detail-dashboard.png)
```

**After (in Plain):**
```markdown
![Dashboard](https://files.plain.com/workspace-files/...)
```

### How It Works

1. **Get Upload URL**: Calls `createWorkspaceFileUploadUrl` mutation to get a signed upload URL
2. **Upload File**: Uploads the image file to Plain's CDN using multipart form data
3. **Replace URL**: Replaces the local path with the CDN URL in the markdown
4. **Cache**: Caches uploaded URLs to avoid re-uploading the same image multiple times

### Supported Image Formats
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- SVG (`.svg`)
- WebP (`.webp`)

### Image Path Resolution
Images are resolved relative to your `ASTRO_ROOT`. For example:
- `/images/guide.png` → `./images/guide.png`
- `public/images/guide.png` → `./public/images/guide.png`

## Frontmatter Support

The script reads the following frontmatter fields:

```yaml
---
title: "My Article Title"           # Used as article title
description: "Brief description"    # Used as article description
slug: "custom-slug"                 # Custom URL slug
draft: true                         # If true, article status = DRAFT
---
```

### Fallback Behavior

If frontmatter is missing:
- **Title**: Uses first H1 heading, or filename
- **Description**: Uses first paragraph (max 160 chars)
- **Slug**: Auto-generated from filename
- **Status**: Defaults to `PUBLISHED`

## Directory Structure

Your folder structure is preserved as article groups:

```
src/content/docs/
├── assessors/              → Article Group: "Assessors"
│   ├── index.mdx          → Article in "Assessors" group
│   └── grant/             → Article Group: "Grant" (child of "Assessors")
│       └── dashboard.mdx  → Article in "Grant" group
└── knowledge-base/        → Article Group: "Knowledge Base"
    └── clear-cache.mdx    → Article in "Knowledge Base" group
```

## Output Example

```
╔════════════════════════════════════════════════════════════╗
║   Plain Help Center Migration Tool                        ║
║   Migrating Astro/Starlight docs to Plain Help Center     ║
╚════════════════════════════════════════════════════════════╝

📁 Source directory: /path/to/docs/src/content/docs
🎯 Target Help Center ID: hc_01JZP74DNB1VZB3FH5T3YP5T05

═══════════════════════════════════════════════════════════
STEP 1: Cleaning up existing content
═══════════════════════════════════════════════════════════

🗑️  Fetching existing articles...
Found 25 articles to delete.
  ✓ Deleted article: "Dashboard"
  ✓ Deleted article: "Settings"
  ...
✓ All articles deleted successfully.

🗑️  Fetching existing article groups...
Found 10 article groups to delete.
  ✓ Deleted group: "Grant"
  ✓ Deleted group: "Assessors"
  ...
✓ All article groups deleted successfully.

═══════════════════════════════════════════════════════════
STEP 2: Importing new content
═══════════════════════════════════════════════════════════

Group created: "Assessors" (id: hcag_123, slug: assessors)

Processing file: /path/to/docs/src/content/docs/assessors/index.mdx
  Uploading image: /images/guides/grant-dashboard.png
  ✓ Uploaded: /images/guides/grant-dashboard.png
✓ Created article: "Assessors" (slug: assessors)

...

═══════════════════════════════════════════════════════════
✅ Migration completed successfully!
═══════════════════════════════════════════════════════════
```

## Troubleshooting

### Images Not Found

If you see warnings like `Image not found: /path/to/image.png`:
- Check that the image path is correct relative to `ASTRO_ROOT`
- Verify the image file exists in your `public/` directory
- Update `ASTRO_ROOT` if needed

### API Errors

If you get API errors:
- Verify your `API_TOKEN` has the correct permissions
- Check that your `HELP_CENTER_ID` is correct
- Ensure you're using the correct GraphQL endpoint for your region

### TypeScript Errors

If you get TypeScript compilation errors:
```bash
npm install -D tsx typescript @types/node
```

## GraphQL Schema Reference

The script uses the following Plain GraphQL mutations:

- `createHelpCenterArticleGroup` - Creates article groups (folders)
- `upsertHelpCenterArticle` - Creates/updates articles
- `deleteHelpCenterArticle` - Deletes articles (cleanup)
- `deleteHelpCenterArticleGroup` - Deletes article groups (cleanup)

Full schema: https://core-api.uk.plain.com/graphql/v1/schema.graphql

## Notes

- **Idempotent**: Running the script multiple times is safe - it deletes everything first
- **Image Caching**: Images are cached after first upload to avoid re-uploading duplicates
- **Rate Limiting**: The script processes files sequentially to avoid rate limits
- **Nested Groups**: Supports unlimited nesting depth for article groups
- **CDN Hosting**: All images are hosted on Plain's CDN for fast, reliable delivery

## Support

For issues with:
- **This script**: Check the console output for specific error messages
- **Plain API**: Refer to Plain's documentation or support
- **Markdown conversion**: Check the `marked` library documentation

## License

This migration tool is provided as-is for migrating documentation to Plain Help Center.

