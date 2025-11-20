import path from "node:path";
import fs from "node:fs";
import { GraphQLClient, gql } from "graphql-request";
import { marked } from "marked";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Config - UPDATE FIELDS HERE
const API_TOKEN = process.env.PLAIN_API_TOKEN || ""; // Load from .env
const HELP_CENTER_ID = process.env.PLAIN_HELP_CENTER_ID || ""; // Load from .env
const WORKSPACE_ID = "w_01JCQQ66MV92X43PPFXRZH82K0";
const PLAIN_GRAPHQL_ENDPOINT = "https://core-api.uk.plain.com/graphql/v1";
// Astro project structure
const ASTRO_ROOT = "./"; // Root of your Astro project
const DOCS_DIR = "src/content/docs"; // Location of your docs

// Mode: 'full' = process all files, 'incremental' = only process modified files
const MODE = process.env.MODE || 'incremental'; // Set MODE=full to process all files

// Load Astro config to get custom slugs
const ASTRO_CONFIG_PATH = path.resolve(ASTRO_ROOT, 'astro.config.mjs');
let customSlugsMap = new Map<string, string>(); // Maps file path to custom slug

// Setup GraphQL Client
const graphQLClient = new GraphQLClient(PLAIN_GRAPHQL_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

// GraphQL mutations - Using the exact mutations from the schema with all relevant fields
const createArticleGroupMutation = gql`
  mutation createHelpCenterArticleGroup($input: CreateHelpCenterArticleGroupInput!) {
    createHelpCenterArticleGroup(input: $input) {
      helpCenterArticleGroup {
        id
        name
        slug
        parentArticleGroup {
          id
          name
        }
        createdAt {
          iso8601
        }
        updatedAt {
          iso8601
        }
      }
      error {
        message
        type
        code
        fields {
          field
          message
          type
        }
      }
    }
  }
`;

const upsertArticleMutation = gql`
  mutation upsertHelpCenterArticle($input: UpsertHelpCenterArticleInput!) {
    upsertHelpCenterArticle(input: $input) {
      helpCenterArticle {
        id
        title
        slug
        description
        status
        articleGroup {
          id
          name
          slug
        }
        createdAt {
          iso8601
        }
        updatedAt {
          iso8601
        }
      }
      error {
        message
        type
        code
        fields {
          field
          message
          type
        }
      }
    }
  }
`;

const deleteArticleMutation = gql`
  mutation deleteHelpCenterArticle($input: DeleteHelpCenterArticleInput!) {
    deleteHelpCenterArticle(input: $input) {
      error {
        message
        type
        code
        fields {
          field
          message
          type
        }
      }
    }
  }
`;

const deleteArticleGroupMutation = gql`
  mutation deleteHelpCenterArticleGroup($input: DeleteHelpCenterArticleGroupInput!) {
    deleteHelpCenterArticleGroup(input: $input) {
      error {
        message
        type
        code
        fields {
          field
          message
          type
        }
      }
    }
  }
`;

const createWorkspaceFileUploadUrlMutation = gql`
  mutation createWorkspaceFileUploadUrl($input: CreateWorkspaceFileUploadUrlInput!) {
    createWorkspaceFileUploadUrl(input: $input) {
      error {
        message
        type
        code
      }
      workspaceFileUploadUrl {
        uploadFormUrl
        uploadFormData {
          key
          value
        }
        workspaceFile {
          id
        }
      }
    }
  }
`;

const getHelpCenterQuery = gql`
  query getHelpCenter($id: ID!) {
    helpCenter(id: $id) {
      id
      publicName
      articles {
        edges {
          node {
            id
            title
            slug
          }
        }
      }
      articleGroups {
        edges {
          node {
            id
            name
            slug
            parentArticleGroup {
              id
            }
          }
        }
      }
    }
  }
`;

// Helper: Convert file name to slug
function toSlug(filename: string) {
  return filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper: Generate slug from file path (using Astro config or default)
function generateSlugFromPath(filePath: string): string {
  // Check if we have a custom slug from Astro config
  if (customSlugsMap.has(filePath)) {
    const customSlug = customSlugsMap.get(filePath)!;
    // Replace / with - for Plain's slug format
    return customSlug.replace(/\//g, '-');
  }
  
  // Fallback to default slug generation
  const docsAbsPath = path.resolve(ASTRO_ROOT, DOCS_DIR);
  const relativePath = path.relative(docsAbsPath, filePath);
  
  // Remove file extension
  const withoutExt = relativePath.replace(/\.(md|mdx)$/, '');
  
  // Remove 'index' from the end if present
  const withoutIndex = withoutExt.replace(/\/index$/, '');
  
  // Replace path separators with hyphens to create slug
  // e.g., assessors/grant/application/header -> assessors-grant-application-header
  const slug = withoutIndex.replace(/\//g, '-');
  
  return slug;
}

// Cache for uploaded images to avoid re-uploading the same image
const uploadedImagesCache = new Map<string, string>();

// Helper: Upload image to Plain and get URL
async function uploadImageToPlain(imagePath: string): Promise<string | null> {
  try {
    // Check cache first
    if (uploadedImagesCache.has(imagePath)) {
      return uploadedImagesCache.get(imagePath)!;
    }
    
    // Remove leading slash and prepend 'public/' for Astro structure
    let relativePath = imagePath.replace(/^\//, '');
    
    // Images in Astro are served from /public, so prepend 'public/' to the path
    const fullPath = path.resolve(ASTRO_ROOT, 'public', relativePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`  Image not found: ${fullPath}`);
      return null;
    }
    
    // Step 2: Read the file
    const imageBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);
    const fileSizeBytes = imageBuffer.length;
    
    // Step 1: Get upload URL from Plain with all required fields
    const uploadData: any = await graphQLClient.request(createWorkspaceFileUploadUrlMutation, {
      input: {
        fileName: fileName,
        fileSizeBytes: fileSizeBytes,
        visibility: "PUBLIC"
      }
    });
    
    if (uploadData.createWorkspaceFileUploadUrl.error) {
      console.error(`  Failed to get upload URL: ${uploadData.createWorkspaceFileUploadUrl.error.message}`);
      return null;
    }
    
    const { uploadFormUrl, uploadFormData, workspaceFile } = uploadData.createWorkspaceFileUploadUrl.workspaceFileUploadUrl;
    
    // Determine MIME type from extension
    const ext = path.extname(fullPath).toLowerCase();
    let mimeType = 'image/png'; // default
    
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.png') {
      mimeType = 'image/png';
    } else if (ext === '.gif') {
      mimeType = 'image/gif';
    } else if (ext === '.svg') {
      mimeType = 'image/svg+xml';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }
    
    // Create FormData for upload using form-data package
    const FormDataNode = (await import('form-data')).default;
    const axios = (await import('axios')).default;
    const form = new FormDataNode();
    
    // Add all the form data fields from Plain FIRST
    uploadFormData.forEach((field: any) => {
      form.append(field.key, field.value);
    });
    
    // Add the file LAST
    form.append('file', imageBuffer, { filename: fileName });
    
    // Upload to the provided URL using axios (as per Plain's example)
    try {
      const uploadResponse = await axios.post(uploadFormUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      
      if (uploadResponse.status !== 204 && uploadResponse.status !== 200) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
    } catch (error: any) {
      const errorDetails = error.response?.data || error.message;
      console.error(`  Failed to upload image: ${error.response?.status || 'unknown'} ${error.response?.statusText || ''}`);
      console.error(`  Error details:`, errorDetails);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Store the workspace file ID for use in HTML img tags
    const workspaceFileId = workspaceFile.id;
    
    // Cache the workspace file ID
    uploadedImagesCache.set(imagePath, workspaceFileId);
    
    return workspaceFileId;
  } catch (error) {
    console.error(`  Error uploading image ${imagePath}:`, error);
    return null;
  }
}

// Helper: Collect all unique images from markdown content
function collectImagesFromMarkdown(content: string): Set<string> {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = new Set<string>();
  const matches = [...content.matchAll(imageRegex)];
  
  for (const match of matches) {
    const imagePath = match[2];
    
    // Skip if it's already an external URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue;
    }
    
    images.add(imagePath);
  }
  
  return images;
}

// Helper: Preprocess markdown to fix common issues
function preprocessMarkdown(content: string): string {
  let processed = content;
  
  // Fix indented list items that marked treats as code blocks
  // Convert lines with 4+ spaces followed by "- " to use only 2 spaces
  // This prevents marked from treating them as code blocks
  const lines = processed.split('\n');
  const fixedLines = lines.map(line => {
    // Check if line starts with 4 or more spaces followed by a list marker
    const match = line.match(/^(\s{4,})([-*+]\s)/);
    if (match) {
      // Calculate how many levels of indentation (each level = 4 spaces)
      const spaces = match[1].length;
      const levels = Math.floor(spaces / 4);
      // Replace with 2 spaces per level (markdown standard)
      const newIndent = '  '.repeat(levels);
      return newIndent + match[2] + line.substring(match[0].length);
    }
    return line;
  });
  
  processed = fixedLines.join('\n');
  
  return processed;
}

// Helper: Replace image paths in HTML with workspace file IDs
function replaceImagePathsInHtml(html: string): string {
  // Match HTML img tags generated by marked: <img src="path" alt="text">
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g;
  
  let processedHtml = html;
  const matches = [...html.matchAll(imgRegex)];
  
  for (const match of matches) {
    const fullMatch = match[0];
    const beforeSrc = match[1];
    const imagePath = match[2];
    const afterSrc = match[3];
    
    // Skip if it's already an external URL or data URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      continue;
    }
    
    // Get the uploaded workspace file ID from cache
    const workspaceFileId = uploadedImagesCache.get(imagePath);
    if (workspaceFileId) {
      // Replace with img tag using data-workspace-file-id
      // Extract alt text if present
      const altMatch = fullMatch.match(/alt=["']([^"']*)["']/);
      const altText = altMatch ? altMatch[1] : '';
      
      const newImgTag = `<img src="" alt="${altText}" data-workspace-file-id="${workspaceFileId}">`;
      processedHtml = processedHtml.replace(fullMatch, newImgTag);
    }
  }
  
  return processedHtml;
}

// Types for frontmatter
interface Frontmatter {
  title?: string;
  description?: string;
  slug?: string;
  draft?: string | boolean;
  [key: string]: any;
}

// Helper: Extract frontmatter from Astro/MDX content
function extractFrontmatter(content: string): { content: string; frontmatter: Frontmatter } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return { content, frontmatter: {} };
  
  const frontmatterStr = match[1];
  const frontmatter: Frontmatter = {};
  
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      frontmatter[key] = value;
    }
  });
  
  const contentWithoutFrontmatter = content.slice(match[0].length);
  return { content: contentWithoutFrontmatter, frontmatter };
}

// Store group IDs to avoid recreating them
const groupCache = new Map<string, string>();

// Parse Astro config to extract custom slugs
function parseAstroConfigSlugs(): Map<string, string> {
  const slugMap = new Map<string, string>();
  
  try {
    if (!fs.existsSync(ASTRO_CONFIG_PATH)) {
      console.warn('Astro config not found, using default slug generation');
      return slugMap;
    }
    
    const configContent = fs.readFileSync(ASTRO_CONFIG_PATH, 'utf-8');
    
    // Extract sidebar items with slugs using regex
    // Match patterns like: { label: "...", slug: "assessors/grant/application/header" }
    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    let match;
    
    while ((match = slugRegex.exec(configContent)) !== null) {
      const slug = match[1];
      
      // Convert slug to file path
      // e.g., "assessors/grant/application/header" -> "src/content/docs/assessors/grant/application/header.mdx"
      const possiblePaths = [
        path.resolve(ASTRO_ROOT, DOCS_DIR, `${slug}.mdx`),
        path.resolve(ASTRO_ROOT, DOCS_DIR, `${slug}.md`),
        path.resolve(ASTRO_ROOT, DOCS_DIR, slug, 'index.mdx'),
        path.resolve(ASTRO_ROOT, DOCS_DIR, slug, 'index.md'),
      ];
      
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          slugMap.set(filePath, slug);
          break;
        }
      }
    }
    
    console.log(`Loaded ${slugMap.size} custom slugs from Astro config`);
    
  } catch (error) {
    console.warn('Error parsing Astro config:', error);
  }
  
  return slugMap;
}

// Get modified markdown files from git
function getModifiedMarkdownFiles(): Set<string> {
  const modifiedFiles = new Set<string>();
  
  try {
    // Get modified, added, and untracked files
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    
    const lines = gitStatus.split('\n').filter((line: string) => line.trim());
    
    for (const line of lines) {
      // Git status format: XY filename
      // X = index status, Y = working tree status
      const status = line.substring(0, 2);
      const filePath = line.substring(3).trim();
      
      // Only process markdown files in the docs directory
      if ((filePath.endsWith('.md') || filePath.endsWith('.mdx')) && 
          filePath.startsWith(DOCS_DIR)) {
        const fullPath = path.resolve(ASTRO_ROOT, filePath);
        if (fs.existsSync(fullPath)) {
          modifiedFiles.add(fullPath);
        }
      }
    }
    
    console.log(`Found ${modifiedFiles.size} modified markdown file(s) in git.`);
    
  } catch (error) {
    console.warn('Warning: Could not get git status. Falling back to full mode.');
    console.warn('Error:', error);
  }
  
  return modifiedFiles;
}

// Create article group using the correct mutation
async function createArticleGroup(groupName: string, parentGroupId?: string): Promise<string> {
  // Check if we've already created this group
  const cacheKey = parentGroupId ? `${parentGroupId}:${groupName}` : groupName;
  if (groupCache.has(cacheKey)) {
    return groupCache.get(cacheKey)!;
  }

  // Format the title properly
  const name = groupName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()); // Convert to title case
  
  // Generate a slug for the group
  const slug = toSlug(groupName);
  
  try {
    const variables = {
      input: {
        helpCenterId: HELP_CENTER_ID,
        parentHelpCenterArticleGroupId: parentGroupId || null,
        name,
        slug
      }
    };

    const data: any = await graphQLClient.request(
      createArticleGroupMutation,
      variables
    );

    if (data.createHelpCenterArticleGroup.error) {
      throw new Error(`API Error: ${data.createHelpCenterArticleGroup.error.message}`);
    }

    const groupId = data.createHelpCenterArticleGroup.helpCenterArticleGroup.id;
    groupCache.set(cacheKey, groupId);
    console.log(`Group created: "${name}" (id: ${groupId}, slug: ${slug})`);
    return groupId;
  } catch (error: any) {
    console.error(`Failed to create group for ${groupName}`, error.response?.errors || error);
    throw error;
  }
}

// Process a single markdown file
async function processMarkdownFile(filePath: string, groupId?: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content, frontmatter } = extractFrontmatter(fileContent);
  
  // Use frontmatter title if available, otherwise use first heading or filename
  let title: string = frontmatter.title || "";
  
  if (!title) {
    // Use first heading if available
    const headingMatch = content.match(/^#+\s+(.+)$/m);
    if (headingMatch) {
      title = headingMatch[1];
    } else {
      // Fallback to filename
      const basename = path.basename(filePath, path.extname(filePath));
      title = basename === "index" 
        ? path.basename(path.dirname(filePath))
        : basename;
      
      // Clean up the title
      title = title.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
  }
  
  // Use frontmatter description or generate one
  let description: string = frontmatter.description || "";
  
  if (!description) {
    // Get first paragraph that's not a heading or image
    const paragraphs = content.split(/\n\s*\n/);
    for (const paragraph of paragraphs) {
      if (!paragraph.startsWith('#') && !paragraph.startsWith('!') && paragraph.trim().length > 0) {
        description = paragraph.trim().slice(0, 160);
        break;
      }
    }
  }
  
  // Preprocess content to fix indented lists that marked treats as code
  const preprocessedContent = preprocessMarkdown(content);
  
  // Convert the markdown to HTML first
  let contentHtml = marked(preprocessedContent) as string;
  
  // Then replace image tags in the HTML with workspace file IDs
  contentHtml = replaceImagePathsInHtml(contentHtml);
  
  // Generate slug from file path (matching Astro's slug structure)
  // Convert file path to slug: src/content/docs/assessors/grant/application/header.mdx -> assessors-grant-application-header
  const slug: string = frontmatter.slug || generateSlugFromPath(filePath);
  
  // Use frontmatter status or default to PUBLISHED
  const status = (frontmatter.draft === "true" || frontmatter.draft === true) 
    ? "DRAFT" 
    : "PUBLISHED";
  
  try {
    const variables = {
      input: {
        helpCenterId: HELP_CENTER_ID,
        helpCenterArticleGroupId: groupId || null,
        title,
        description,
        contentHtml,
        slug,
        status
      }
    };

    const data: any = await graphQLClient.request(
      upsertArticleMutation,
      variables
    );
    
    if (data.upsertHelpCenterArticle.error) {
      throw new Error(`API Error: ${data.upsertHelpCenterArticle.error.message}`);
    }
    
    console.log(
      `✓ Created article: "${title}" (slug: ${data.upsertHelpCenterArticle.helpCenterArticle.slug})`
    );
  } catch (error: any) {
    console.error(
      `✗ Failed to create article from file ${filePath}`,
      error.response?.errors || error
    );
  }
}

// Collect all images from markdown files (either all or only modified)
async function collectAllImages(dirPath: string, modifiedFilesSet?: Set<string>): Promise<Set<string>> {
  const allImages = new Set<string>();
  
  // If we have a specific set of modified files, only collect from those
  if (modifiedFilesSet && modifiedFilesSet.size > 0) {
    for (const filePath of modifiedFilesSet) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { content } = extractFrontmatter(fileContent);
        const images = collectImagesFromMarkdown(content);
        images.forEach(img => allImages.add(img));
      }
    }
    return allImages;
  }
  
  // Otherwise, collect from all files recursively
  // Skip node_modules and other common excluded directories
  if (path.basename(dirPath).startsWith('.') || 
      path.basename(dirPath) === 'node_modules') {
    return allImages;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    return allImages;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Process markdown files in this directory
  const markdownFiles = entries.filter(entry => 
    !entry.isDirectory() && 
    (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
  );
  
  for (const file of markdownFiles) {
    const filePath = path.join(dirPath, file.name);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { content } = extractFrontmatter(fileContent);
    const images = collectImagesFromMarkdown(content);
    images.forEach(img => allImages.add(img));
  }
  
  // Process subdirectories
  const directories = entries.filter(entry => entry.isDirectory());
  for (const dir of directories) {
    const subImages = await collectAllImages(path.join(dirPath, dir.name));
    subImages.forEach(img => allImages.add(img));
  }
  
  return allImages;
}

// Process directory recursively (or only specific files)
async function processDirectory(dirPath: string, parentGroupId?: string, modifiedFilesSet?: Set<string>) {
  // If we have a specific set of modified files, only process those
  if (modifiedFilesSet && modifiedFilesSet.size > 0) {
    for (const filePath of modifiedFilesSet) {
      if (fs.existsSync(filePath)) {
        // Get the directory structure for this file
        const fileDir = path.dirname(filePath);
        const docsAbsPath = path.resolve(ASTRO_ROOT, DOCS_DIR);
        const relativePath = path.relative(docsAbsPath, fileDir);
        
        // Create necessary groups for the file's path
        let currentGroupId = parentGroupId;
        if (relativePath && relativePath !== '.') {
          const pathParts = relativePath.split(path.sep);
          let tempParentId = parentGroupId;
          
          for (const part of pathParts) {
            tempParentId = await createArticleGroup(part, tempParentId);
          }
          currentGroupId = tempParentId;
        }
        
        // Process the file
        await processMarkdownFile(filePath, currentGroupId);
      }
    }
    return;
  }
  
  // Otherwise, process all files recursively
  // Skip node_modules and other common excluded directories
  if (path.basename(dirPath).startsWith('.') || 
      path.basename(dirPath) === 'node_modules') {
    return;
  }
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory does not exist: ${dirPath}`);
    return;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Create group for this directory if it's not the root
  let currentGroupId = parentGroupId;
  const docsAbsPath = path.resolve(ASTRO_ROOT, DOCS_DIR);
  
  if (dirPath !== docsAbsPath) {
    const relativePath = path.relative(docsAbsPath, dirPath);
    if (relativePath) {
      // Get the directory name for the group
      const dirName = path.basename(dirPath);
      currentGroupId = await createArticleGroup(dirName, parentGroupId);
    }
  }
  
  // Process markdown files in this directory
  const markdownFiles = entries.filter(entry => 
    !entry.isDirectory() && 
    (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
  );
  
  for (const file of markdownFiles) {
    await processMarkdownFile(path.join(dirPath, file.name), currentGroupId);
  }
  
  // Process subdirectories
  const directories = entries.filter(entry => entry.isDirectory());
  for (const dir of directories) {
    await processDirectory(path.join(dirPath, dir.name), currentGroupId);
  }
}

// Delete all existing articles in the help center
async function deleteAllArticles() {
  console.log("\n🗑️  Fetching existing articles...");
  
  try {
    const data: any = await graphQLClient.request(getHelpCenterQuery, {
      id: HELP_CENTER_ID
    });
    
    const articles = data.helpCenter.articles.edges;
    
    if (articles.length === 0) {
      console.log("No articles to delete.");
      return;
    }
    
    console.log(`Found ${articles.length} articles to delete.`);
    
    for (const edge of articles) {
      const article = edge.node;
      try {
        await graphQLClient.request(deleteArticleMutation, {
          input: {
            helpCenterArticleId: article.id
          }
        });
        console.log(`  ✓ Deleted article: "${article.title}"`);
      } catch (error: any) {
        console.error(`  ✗ Failed to delete article "${article.title}":`, error.response?.errors || error);
      }
    }
    
    console.log("✓ All articles deleted successfully.");
  } catch (error: any) {
    console.error("Failed to fetch or delete articles:", error.response?.errors || error);
    throw error;
  }
}

// Delete all existing article groups in the help center
async function deleteAllArticleGroups() {
  console.log("\n🗑️  Fetching existing article groups...");
  
  try {
    const data: any = await graphQLClient.request(getHelpCenterQuery, {
      id: HELP_CENTER_ID
    });
    
    const groups = data.helpCenter.articleGroups.edges;
    
    if (groups.length === 0) {
      console.log("No article groups to delete.");
      return;
    }
    
    console.log(`Found ${groups.length} article groups to delete.`);
    
    // Sort groups to delete children before parents
    // Groups with no parent should be deleted last
    const sortedGroups = groups.sort((a: any, b: any) => {
      const aHasParent = a.node.parentArticleGroup !== null;
      const bHasParent = b.node.parentArticleGroup !== null;
      
      // If both have parents or both don't, maintain order
      if (aHasParent === bHasParent) return 0;
      // Delete children (with parents) first
      if (aHasParent) return -1;
      return 1;
    });
    
    for (const edge of sortedGroups) {
      const group = edge.node;
      try {
        await graphQLClient.request(deleteArticleGroupMutation, {
          input: {
            helpCenterArticleGroupId: group.id
          }
        });
        console.log(`  ✓ Deleted group: "${group.name}"`);
      } catch (error: any) {
        console.error(`  ✗ Failed to delete group "${group.name}":`, error.response?.errors || error);
      }
    }
    
    console.log("✓ All article groups deleted successfully.");
  } catch (error: any) {
    console.error("Failed to fetch or delete article groups:", error.response?.errors || error);
    throw error;
  }
}

// Main function
async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Plain Help Center Migration Tool                        ║");
  console.log("║   Migrating Astro/Starlight docs to Plain Help Center     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  const docsPath = path.resolve(ASTRO_ROOT, DOCS_DIR);
  console.log(`📁 Source directory: ${docsPath}`);
  console.log(`🎯 Target Help Center ID: ${HELP_CENTER_ID}`);
  console.log(`⚙️  Mode: ${MODE}\n`);
  
  // Load custom slugs from Astro config
  customSlugsMap = parseAstroConfigSlugs();
  console.log();
  
  // Get modified files if in incremental mode
  let modifiedFiles: Set<string> | undefined;
  if (MODE === 'incremental') {
    modifiedFiles = getModifiedMarkdownFiles();
    
    if (modifiedFiles.size === 0) {
      console.log("✅ No modified files found. Nothing to update!");
      return;
    }
    
    console.log("\nModified files:");
    modifiedFiles.forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file)}`);
    });
    console.log();
  }
  
  // Step 1: Delete all existing content (only in full mode)
  if (MODE === 'full') {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("STEP 1: Cleaning up existing content");
    console.log("═══════════════════════════════════════════════════════════");
    
    await deleteAllArticles();
    await deleteAllArticleGroups();
  }
  
  // Step 2: Collect and upload images
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`STEP ${MODE === 'full' ? '2' : '1'}: Collecting and uploading images`);
  console.log("═══════════════════════════════════════════════════════════\n");
  
  const allImages = await collectAllImages(docsPath, modifiedFiles);
  console.log(`Found ${allImages.size} unique images to upload.\n`);
  
  let uploadedCount = 0;
  for (const imagePath of allImages) {
    try {
      console.log(`[${uploadedCount + 1}/${allImages.size}] Uploading: ${imagePath}`);
      const workspaceFileId = await uploadImageToPlain(imagePath);
      if (workspaceFileId) {
        uploadedCount++;
        console.log(`  ✓ Success: ${workspaceFileId}\n`);
      } else {
        console.error(`  ✗ Failed to upload: ${imagePath}`);
        throw new Error(`Failed to upload image: ${imagePath}`);
      }
    } catch (error: any) {
      console.error(`\n❌ Image upload failed: ${imagePath}`);
      console.error(`Error: ${error.message}`);
      console.error("\nExiting migration due to image upload error.");
      process.exit(1);
    }
  }
  
  console.log(`✓ Successfully uploaded ${uploadedCount} images.\n`);
  
  // Step 3: Import content with uploaded image URLs
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`STEP ${MODE === 'full' ? '3' : '2'}: Importing articles and groups`);
  console.log("═══════════════════════════════════════════════════════════\n");
  
  await processDirectory(docsPath, undefined, modifiedFiles);
  
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`✅ ${MODE === 'incremental' ? 'Incremental update' : 'Full migration'} completed successfully!`);
  if (MODE === 'incremental' && modifiedFiles) {
    console.log(`   Updated ${modifiedFiles.size} file(s)`);
  }
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch(console.error);